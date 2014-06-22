echo $1
if [ "$1" = "" ] ; then
    echo "missing version parameter"
else
    echo "building version $1"
    grunt build
	echo "removing ../backend/static/$1"
	rm -rf ../backend/static/$1
	echo "copying new version to ../backend/static/$1"
	cp -R dist/ ../backend/static/$1
	# open "../backend/static/$1"
	appcfg.py update "../backend" --email "orhiltch@gmail.com"
fi

