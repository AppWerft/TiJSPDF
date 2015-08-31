var _jsPDF = require('index');

var _isAndroid = Ti.Platform.osname === 'android';
var _tempFile = null;
(function() {
	var win = Ti.UI.createWindow({
		backgroundColor : '#eee',
		height : Ti.UI.FILL,
		layout : 'vertical',
		title : 'jsPDF Sample',
		width : Ti.UI.FILL
	});
	win.addEventListener('open', function(e) {
		var columns = ["ID", "Name", "Country", "Count"];
		var rows = [[1, "Shaw", "Tanzania", "12345"], [2, "Nelson", "Kazakhstan", "345567"], [3, "Garcia", "Madagascar", "8365734"]];
		var doc = new _jsPDF();
		doc.setProperties({
			title : 'Title',
			subject : 'This is the subject',
			author : 'John Doe',
			keywords : 'one, two, three',
			creator : 'Someone'
		});
		doc.autoTable(columns, rows);
		console.log(doc.autoTableEndPosY());
		function addQRCode(qroptions, x, y, width, color) {
			var PADDING = 5;
			var qrcode = new (require('de.appwerft.qrcode'))(qroptions.data, qroptions.ecstrategy, qroptions.maskPattern, qroptions.version, qroptions.dataOnly, qroptions.maskTest);
			var code = qrcode.getData();
			var R = width / qrcode.getSize();
			doc.setDrawColor(color);
			doc.setFillColor(color);
			for (var r = 0; r < code.length; r += 1) {
				for (var c = 0; c < code[r].length; c += 1) {
					if (code[r][c] === 1) {
						/*1% more size to cover the border of rect. */
						doc.rect(PADDING + 5 + r * R, PADDING + 100 + c * R, R * 1.01, R * 1.01, 'F');
					}
				}
			}
		}
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
		doc.addPage();
		doc.rect(20, 120, 10, 10);
		// empty square
		doc.rect(40, 120, 10, 10, 'F');
		// filled square
		var imgSample2 = Ti.Filesystem.resourcesDirectory + 'image2.jpg';
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

		if (_isAndroid) {
			var intent = Ti.Android.createIntent({
				action : Ti.Android.ACTION_VIEW,
				type : "application/pdf",
				data : _tempFile.nativePath
			});

			try {
				Ti.Android.currentActivity.startActivity(intent);
			} catch(e) {
				Ti.API.debug(e);
				alert('You have no apps on your device that can open PDFs.');
			}
		} else {

			var winPDF = Ti.UI.createWindow({
				backgroundColor : '#eee',
				height : Ti.UI.FILL,
				title : 'PDF Preview',
				width : Ti.UI.FILL
			});
			var btnClose = Ti.UI.createButton({
				title : 'Close'
			});
			btnClose.addEventListener('click', function(e) {
				winPDF.close();
			});
			winPDF.setRightNavButton(btnClose);
			var pdfview = Ti.UI.createWebView({
				backgroundColor : '#eee',
				url : _tempFile.nativePath,
				height : Ti.UI.FILL,
				width : Ti.UI.FILL
			});
			winPDF.add(pdfview);
			winPDF.open({
				modal : true
			});
		}

	});

	win.addEventListener('click', function(e) {
		var filename = "ss.jpeg";
		var ss = win.toImage();
		var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
		Ti.API.info('ss: ' + f.nativePath);
		f.write(ss);
		f = null;
		label.text = 'done';
	});
	win.addEventListener('close', function(e) {
		if (_tempFile != null) {
			_tempFile.deleteFile();
		}
		_tempFile = null;
	});

	win.open({
		modal : true
	});
})();
