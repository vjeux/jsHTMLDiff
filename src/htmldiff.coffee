
class window.HTMLDiff
	constructor: (@a, @b) ->

	diff: ->
		diff = @diff_list (@tokenize @a), (@tokenize @b)
		@update @a, diff.filter ([status, text]) -> status != '+'
		@update @b, diff.filter ([status, text]) -> status != '-'

	# http://stackoverflow.com/a/4399718/232122
	parseTextNodes: (node, callback) ->
		handleNode = (node) ->
			if node.nodeType == 3
				if not /^\s*$/.test(node.nodeValue)
					# If it's not an empty text node, callback
					callback node
			else
				# We make a copy of the children array because we may add/remove children
				for old_node in (n for n in node.childNodes)
					new_nodes = handleNode old_node
					if new_nodes
						# If we are provided an array of nodes,
						# we add them all before the current node
						for new_node in new_nodes
							node.insertBefore new_node, old_node

						# And we remove the current node
						node.removeChild old_node
				false

		handleNode node

	tokenize: (root) ->
		tokens = []
		@parseTextNodes root, (node) ->
			tokens = tokens.concat node.nodeValue.split ' '
			false
		tokens

	update: (root, diff) ->
		pos = 0
		@parseTextNodes root, (node) ->
			# Get the text we need to update
			start = pos
			end = pos + (node.nodeValue.split ' ').length
			pos = end

			# Add <ins></ins> where needed
			output = for [status, text] in diff[start ... end]
				if status == '='
					text
				else
					'<ins>' + text + '</ins>'

			# Remove empty <ins> and group consecutive </ins>[white]<ins>
			output = output.join(' ')
				.replace(/<\/ins> <ins>/g, ' ')
				.replace(/<ins> /g, ' <ins>')
				.replace(/[ ]<\/ins>/g, '</ins> ')
				.replace(/<ins><\/ins>/g, '')

			# Replace the html string with a sequence of Text/Ins nodes
			new_nodes = []
			new_node = document.createTextNode()
			new_nodes.push new_node
			for part in output.split /(<\/?ins>)/
				switch part
					when '<ins>'
						ins_node = document.createElement 'ins'
						new_nodes.push ins_node
						new_node = document.createTextNode()
						ins_node.appendChild new_node
					when '</ins>'
						new_node = document.createTextNode()
						new_nodes.push new_node
					else
						new_node.nodeValue = part

			# Remove empty text nodes
			new_nodes.filter (node) -> not (node.nodeType == 3 and node.nodeValue == '')


	# Simple Diff for Python v0.1
	# (C) Paul Butler 2008 <http://www.paulbutler.org/>
	diff_list: (before, after) ->
		# Find the differences between two lists. Returns a list of pairs, where the first value
		# is in ['+','-','='] and represents an insertion, deletion, or no change for that list.
		# The second value of the pair is the element.

		# Build a hash map with elements from before as keys, and
		# a list of indexes as values
		ohash = {}
		for val, i in before
			if val not of ohash
				ohash[val] = []
			ohash[val].push i

		# Find the largest substring common to before and after
		lastRow = (0 for i in [0 ... before.length])
		subStartBefore = subStartAfter = subLength = 0
		for val, j in after
			thisRow = (0 for i in [0 ... before.length])
			for k in ohash[val] ? []
				thisRow[k] = (if k and lastRow[k - 1] then 1 else 0) + 1
				if thisRow[k] > subLength
					subLength = thisRow[k]
					subStartBefore = k - subLength + 1
					subStartAfter = j - subLength + 1
			lastRow = thisRow

		# If no common substring is found, assume that an insert and
		# delete has taken place
		if subLength == 0
			[].concat(
				(['-', val] for val in before),
				(['+', val] for val in after)
			)

		# Otherwise, the common substring is considered to have no change, and we recurse
		# on the text before and after the substring
		else
			[].concat(
				@diff_list(before[...subStartBefore], after[...subStartAfter]),
				(['=', val] for val in after[subStartAfter...subStartAfter + subLength]),
				@diff_list(before[subStartBefore + subLength...], after[subStartAfter + subLength...])
			)
