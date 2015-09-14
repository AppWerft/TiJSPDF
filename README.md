###Appcelerator Titanium - Image, Table and QRcode support in jsPDF### ![](https://camo.githubusercontent.com/aab7a80c6cb487e82736414b2d9be1e969a3672e/687474703a2f2f676974742e696f2f62616467652e706e67)


![](http://i.imgur.com/ctaRBc1.png)

This is a extendet version of JSPDF with support of WinANSI. You can write i.e. german umlaute
Additional you can use tables and QR code inside PDF


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
    qr : {
        data : 'http://github.com/',
        ec : 'M'
    }, 
    x : 5, 
    y : 100, 
    width : 45
});

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
module.exports = function() {
    var PDF = new (require('de.appwerft.jspdf'))();
    PDF.setProperties({
        title : 'Übertitel',
        subject : 'Betreff',
        author : 'John Doe',
        keywords : 'one, two, three',
        creator : 'Düzgün Jildiz'
    });
    PDF.addQRCode({
        qr : {
            data : 'Wer das liest ist doof.'
        },
        x : 160,
        y : 10,
        width : 40
    });
    PDF.setFont("Helevetica");
    PDF.addAutoTable({
        headers : ["ID", "Name", "Country", "Count"],
        data : [[1, "Noname", "Ödland", "12345"], [2, "Nelson", "Kazakhstan", "345567"], [3, "Garcia", "Madagascar", "8365734"]],
        options : {
            margin : {
            top : 70,
            left : 10,
        },
        tableWidth : '100%'
        }
    });
    //console.log(PDF.autoTableEndPosY());
/*
*/

    PDF.setDrawColor(0);
    PDF.addImage(Ti.Filesystem.resourcesDirectory + '/assets/image1.jpg', 'JPEG', 100	, 180, 128, 72);
  	PDF.setFontType("bold");
    PDF.setFontSize(27);
    PDF.text( PDF.splitTextToSize('Welch fieser Katzentyp quält da süße Vögel bloß zum Jux?', 110),10, 190);
    PDF.addPage();
    PDF.rect(20, 120, 10, 10);
    // empty square
    PDF.rect(40, 120, 10, 10, 'F');
    // filled square
    PDF.addImage(Ti.Filesystem.resourcesDirectory + '/assets/image2.jpg', 'JPEG', 70, 10, 100, 120);
    PDF.setFont("helvetica");
    PDF.setFontType("normal");
    PDF.setFontSize(24);
    var timeStampName = 'Angebot_' + Ti.App.Properties.getInt('nr', 0);
    var _tempFile = Ti.Filesystem.getFile(Ti.Filesystem.getTempDirectory(), timeStampName + '.pdf');
    PDF.save(_tempFile);
    return _tempFile;
};


```
