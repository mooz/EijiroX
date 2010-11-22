#!/bin/sh

cd `dirname $0`

if [ "$1" == "nozip" ]; then ZIP=""; else ZIP="yes"; fi

# chrome
mkdir -p crx
cp -r src/* crx/
#rsync -a --delete src crx
rm -r crx/includes/
cd crx
rm oex.xml unite.xml
if [ $ZIP ]; then
  zip -r ../eijirox.crx *
fi
cd ..


# opera unite
mkdir -p unite
cp -r src/* unite/
#rsync -a --delete src unite
cd unite
cp unite.xml config.xml
rm oex.xml
rm manifest.json
rm -r includes/
if [ $ZIP ]; then
  zip -r ../eijirox.ua *
fi
cd ..


# opera extension
mkdir -p oex
cp -r src/* oex/
#rsync -a --delete src oex
cd oex
cp oex.xml config.xml
rm unite.xml
rm manifest.json
if [ $ZIP ]; then
  zip -r ../eijirox.oex *
fi
cd ..

