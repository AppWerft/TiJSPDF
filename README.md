### Appcelerator Titanium - Image support in jsPDF ###

This is an example app with jsPDF image support plug-in that allows you to use the jsPDF library in Titanium with images, these are currently not currently available with jsPDF when used with Titanium normally.

This version is currently considered pre-release.

Version 0.2

[jsPDF libary](http://parall.ax/products/jspdf) 

I do not claim to be the author of the jsPDF library, this code simply adds preliminary image support when used with Titanium.

### History ###

0.1 Initial proof of concept
0.2 Some tweaks provided by [Ben Bahrenburg](http://bahrenburgs.com/), some of his public work [github.com/benbahrenburg](https://github.com/benbahrenburg)
0.3 Fix for when the PDF is viewed on some desktop systems

### Future updates ###

1.0 Fully tested on iOS and Android with the generated PDFs tested on mobiles as well as desktops for compatibility. 

The 1.0 version of this library will be featured in an upcoming magazine issue of the forthcoming Newsstand magazine "Oracle: Deep Dives" .  This issue will be complete with many examples of code in Alloy and classic with many tips and tricks and walkthroughs on how and why this can now be done.  This document will be updated to show availability.

### addImage Method ###

```javascript
doc.addImage(filename, format, x, y, w, h, imageWidth, imageHeight, imageSize);
/*
    filename
    format (always JPEG)
    x (on page)
    y (on page)
    width (on page)
    height (on page)
    imageWidth (actual width in pxels of source image)
    imageHeight (actual height in pxels of source image)
    imageSize (actual size in bytes of source image)
*/


```

### Example Code ###

```javascript
var _jsPDF = require('./jsPDFMod/TiJSPDF');
var doc = new _jsPDF();
doc.setProperties({
    title: 'Title',
    subject: 'This is the subject',		
    author: 'John Doe',
    keywords: 'one, two, three',
    creator: 'Someone'
});

var imgSample1 = Ti.Filesystem.resourcesDirectory + 'image1.jpg';
doc.addImage(imgSample1, 'JPEG', 10, 20, 128, 96, 1280, 960, 738321);

doc.setFont("helvetica");
doc.setFontType("bold");
doc.setFontSize(24);
doc.text(20, 180, 'Hello world');
doc.text(20, 190, 'This is jsPDF with image support\nusing Titanium..');

doc.addPage();
doc.rect(20, 120, 10, 10); // empty square
doc.rect(40, 120, 10, 10, 'F'); // filled square

var imgSample2 = Ti.Filesystem.resourcesDirectory + 'image2.jpg'
doc.addImage(imgSample2, 'JPEG', 70, 10, 100, 120, 410, 615, 67506);

doc.setFont("helvetica");
doc.setFontType("normal");
doc.setFontSize(24);
doc.text(20, 180, 'This is what I looked like trying to get');
doc.text(20, 190, 'the save function into the plugin system.');
doc.text(20, 200, 'It works now');

doc.text(20, 240, (new Date()).toString());

var timeStampName = new Date().getTime();
if (_tempFile != null) {
    _tempFile.deleteFile();
}
_tempFile = Ti.Filesystem.getFile(Ti.Filesystem.getTempDirectory(), timeStampName + '.pdf');			
doc.save(_tempFile);

```

### Community Enhancements ###

If you manage to improve this project then please tweet me [twitter.com/core_13](twitter.com/core_13) to share what you have achieved and if suitable I will include your changes in the main project and credit you in the code and here.

### Restrictions ###

The jsPDF image module is free for use with personal or commercial projects.
Do what you like with this, no need to credit me - but you can [get in touch](http://core13.co.uk/contact/) to brag about how you used it if you like.
jsPDF licence is available via their website.