### Appcelerator Titanium - Image, Table and QRcode support in jsPDF ###


![](http://i.imgur.com/M8iAtVi.png)

This is an example app with jsPDF image support plug-in that allows you to use the jsPDF library in Titanium with images, these are currently not currently available with jsPDF when used with Titanium normally.
Additional you can use tables and QR code inside PDF

This version is currently considered pre-release.

Doku:
https://mrrio.github.io/jsPDF/doc/symbols/jsPDF.html

TablePlugin:
https://github.com/someatoms/jsPDF-AutoTable


Version 0.2

[jsPDF libary](http://parall.ax/products/jspdf) 

I do not claim to be the author of the jsPDF library, this code simply adds preliminary image support when used with Titanium.

This is a fork of the [Titanium version of Malcom](https://github.com/Core-13/jsPDF-image-support) 


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
   
*/

```

### addQRCode Method ###
```javascript
doc.addQRCode({
    data : 'http://github.com/',
    ec : 'M'
    }, 5, 100, 45
);

```

### autoTable method
```javascript
var columns = ["ID", "Name", "Country", "Count"];
var rows = [[1, "Shaw", "Tanzania", "12345"], [2, "Nelson", "Kazakhstan", "345567"], [3, "Garcia", "Madagascar", "8365734"]];
var options = { // Styling
    theme: 'striped', // 'striped', 'grid' or 'plain'
    styles: {},
    headerStyles: {},
    bodyStyles: {},
    alternateRowStyles: {},
    columnStyles: {},
    // Properties
    startY: false, // false indicates the margin.top value
    margin: 10,
    pageBreak: 'auto', // 'auto', 'avoid', 'always'
    tableWidth: 'auto', // number, 'auto', 'wrap'
};
doc.addAutoTable({
    headers:columns,
    data: rows,
    options : options
});

```


### Example Code ###

```javascript
var doc = new _jsPDF();
doc.setProperties({
    title : 'Title',
    subject : 'This is the subject',
    author : 'John Doe',
    keywords : 'one, two, three',
    creator : 'Someone'
});
doc.addAutoTable({
    headers:["ID", "Name", "Country", "Count"], 
    data : [[1, "Shaw", "Tanzania", "12345"], [2, "Nelson", "Kazakhstan", "345567"], [3, "Garcia", "Madagascar", "8365734"]]
});
console.log(doc.autoTableEndPosY());
doc.addQRCode({
    data : '+',
    ec : 'M'
    }, 5, 100, 45);

doc.setDrawColor(0);
doc.addImage(Ti.Filesystem.resourcesDirectory + 'image1.jpg', 'JPEG', 10, 180, 128, 96);
doc.setFont("helvetica");
doc.setFontType("bold");
doc.setFontSize(24);
doc.text(20, 170, 'Hello world');
doc.text(20, 190, 'This is jsPDF with image support\nusing Titanium');
var timeStampName = new Date().getTime();
if (_tempFile != null) {
    _tempFile.deleteFile();
}
_tempFile = Ti.Filesystem.getFile(Ti.Filesystem.getTempDirectory(), timeStampName + '.pdf');
doc.save(_tempFile);

```
