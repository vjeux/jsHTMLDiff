
all:
	coffee --output lib/ -c src/*.coffee

watch:
	coffee --output lib/ -wc src/*.coffee
