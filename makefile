all:index.html.link
	cp index.html.link compact.html
index.html.link: index.html src/script.js.url src/Daisypict.jpg.url src/basic_color.css.url src/basic_dimentions.css.url
	python Linker.py index.html
src/script.js.link: src/script.js
	python Linker.py src/script.js
src/Daisypict.jpg.link: src/Daisypict.jpg
	python Linker.py src/Daisypict.jpg
src/basic_color.css.link: src/basic_color.css
	python Linker.py src/basic_color.css
src/basic_dimentions.css.link: src/basic_dimentions.css
	python Linker.py src/basic_dimentions.css
src/script.js.url: src/script.js.link
	python Assambler.py src/script.js
src/Daisypict.jpg.url: src/Daisypict.jpg.link
	python Assambler.py src/Daisypict.jpg
src/basic_color.css.url: src/basic_color.css.link
	python Assambler.py src/basic_color.css
src/basic_dimentions.css.url: src/basic_dimentions.css.link
	python Assambler.py src/basic_dimentions.css
clean:
	rm compact.html *.link src/*.link src/*.url

