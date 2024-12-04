// fabric layer

console.log("window", window)

// Do some initializing stuff
fabric.Object.prototype.set({
	transparentCorners: false,
	cornerColor: 'rgba(40,113,100,0.5)',
	cornerSize: 12,
	cornerStyle: 'circle',
	padding: 5
});

const { degrees, PDFDocument, rgb, StandardFonts } = PDFLib

async function savePdf() {
	// Trigger the browser to download the PDF document
	download(__EXISTING_PDF_BYTES, "pdf-lib_modification_example.pdf", "application/pdf");
}

async function modifyPdf() {
	// Load a PDFDocument from the existing PDF bytes
	const pdfDoc = await PDFDocument.load(__EXISTING_PDF_BYTES)

	// Embed the Helvetica font
	const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

	// Get the first page of the document
	const pages = pdfDoc.getPages()
	const firstPage = pages[0]

	// Get the width and height of the first page
	const { width, height } = firstPage.getSize()

	// Draw a timestamped string of text in random location
	const d = new Date();
	let h = addZero(d.getHours());
	let m = addZero(d.getMinutes());
	let s = addZero(d.getSeconds());
	let time = h + ":" + m + ":" + s;
	firstPage.drawText('PDF-Lib Annotation: ' + time, {
		x: getRandomIntInclusive(5, 200),
		y: getRandomIntInclusive(5, height - 100),
		size: 20,
		font: helveticaFont,
		color: rgb(0.95, 0.1, 0.1),
	})
	__EXISTING_PDF_BYTES = await pdfDoc.save();
	showUpdatedPDF();
}

var __PDF_DOC,
	__CURRENT_PAGE,
	__TOTAL_PAGES,
	__PAGE_RENDERING_IN_PROGRESS = 0,
	__CANVAS = $('#pdf-canvas').get(0),
	__CANVAS_CTX = __CANVAS.getContext('2d'),
	__EXISTING_PDF_BYTES,
	__VIEWPORT,
	__SCROLL_X = 0,
	__SCROLL_Y = 0,
	__REMOVE_MODE = false,
	__HIGHLIGHT_MODE = false,
	__FABRIC_CANVAS = new fabric.Canvas('fabricCanvas', {
		selectionLineWidth: 2,
		width: $("#canvasContainer").width(),
		height: $("#canvasContainer").height()
	})
deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E",
	duplicateIcon = "data:image/svg+xml;charset=UTF-8,%3c?xml version='1.0' encoding='UTF-8' standalone='no'?%3e%3c!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3e%3csvg version='1.1' id='Layer_1' x='0px' y='0px' viewBox='0 0 100 100' xml:space='preserve' sodipodi:docname='repeat-small.svg' width='100' height='100' inkscape:version='1.1 (c68e22c387, 2021-05-23)' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3e%3cdefs id='defs1306' /%3e%3csodipodi:namedview id='namedview1304' pagecolor='%23ffffff' bordercolor='%23666666' borderopacity='1.0' inkscape:pageshadow='2' inkscape:pageopacity='0.0' inkscape:pagecheckerboard='0' showgrid='false' fit-margin-top='0' fit-margin-left='0' fit-margin-right='0' fit-margin-bottom='0' inkscape:zoom='0.73651636' inkscape:cx='316.35414' inkscape:cy='139.16867' inkscape:window-width='1751' inkscape:window-height='1041' inkscape:window-x='2079' inkscape:window-y='29' inkscape:window-maximized='0' inkscape:current-layer='Layer_1' /%3e%3cpath style='fill:%23287164;stroke-width:0.211113' d='M 0,50.000842 C 0,22.383254 22.385577,0 49.999154,0 77.614421,0 100,22.383254 100,50.000842 100,77.612944 77.614421,100 49.999154,100 22.386421,100 0,77.612732 0,50.000842 Z' id='path1269' /%3e%3cpath style='fill:%23ffffff;stroke-width:0.211113' d='m 68.240161,28.381818 c -4.226905,-1.162176 -9.533651,-0.376627 -13.832544,-0.376627 -3.604756,0 -7.211198,0 -10.815951,0 0,-1.969682 0,-3.939577 0,-5.909261 0,-0.545516 -0.244681,-0.931642 -0.589005,-1.167667 -0.414417,-0.378103 -1.017566,-0.518704 -1.640561,-0.119278 -5.703217,3.653732 -11.405589,7.308942 -17.107119,10.964364 -0.960774,0.614971 -0.944941,1.946883 0.0095,2.558688 5.701528,3.654577 11.404112,7.309787 17.105641,10.964999 0.945786,0.606316 2.220698,-0.194224 2.220698,-1.271112 0,-2.379455 0,-4.757431 0,-7.136886 6.960818,0 13.923323,0 20.883296,0 4.502406,0 5.592596,3.348886 5.592596,7.120208 0,4.589173 0,9.177715 0,13.766888 0,3.911925 -2.841372,5.493159 -6.316714,5.493159 -4.097491,0 -8.195617,0 -12.292896,0 -7.91927,0 -15.839386,0 -23.757812,0 -5.736362,0 -5.786186,8.883213 -0.06481,8.883213 9.148581,0 18.29695,0 27.445532,0 3.300752,0 6.600026,0 9.900778,0 7.706046,0 13.969134,-6.42079 13.969134,-14.078068 2.12e-4,-10.713561 2.723147,-26.000254 -10.709761,-29.69262 z' id='path1271' /%3e%3cg id='g1273'%3e%3c/g%3e%3cg id='g1275'%3e%3c/g%3e%3cg id='g1277'%3e%3c/g%3e%3cg id='g1279'%3e%3c/g%3e%3cg id='g1281'%3e%3c/g%3e%3cg id='g1283'%3e%3c/g%3e%3cg id='g1285'%3e%3c/g%3e%3cg id='g1287'%3e%3c/g%3e%3cg id='g1289'%3e%3c/g%3e%3cg id='g1291'%3e%3c/g%3e%3cg id='g1293'%3e%3c/g%3e%3cg id='g1295'%3e%3c/g%3e%3cg id='g1297'%3e%3c/g%3e%3cg id='g1299'%3e%3c/g%3e%3cg id='g1301'%3e%3c/g%3e%3c/svg%3e",
	pauseIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns%23' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' width='306.10342mm' height='291.8938mm' viewBox='0 0 306.10343 291.8938' version='1.1' id='svg8' inkscape:version='1.0.1 (3bc2e813f5  2020-09-07)' sodipodi:docname='pause_button.svg'%3E%3Cdefs id='defs2' /%3E%3Csodipodi:namedview id='base' pagecolor='%23ffffff' bordercolor='%23666666' borderopacity='1.0' inkscape:pageopacity='0.0' inkscape:pageshadow='2' inkscape:zoom='0.35' inkscape:cx='669.90509' inkscape:cy='648.63776' inkscape:document-units='mm' inkscape:current-layer='layer1' inkscape:document-rotation='0' showgrid='false' fit-margin-top='0' fit-margin-left='0' fit-margin-right='0' fit-margin-bottom='0' inkscape:window-width='1267' inkscape:window-height='1041' inkscape:window-x='442' inkscape:window-y='6' inkscape:window-maximized='0' /%3E%3Cmetadata id='metadata5'%3E%3Crdf:RDF%3E%3Ccc:Work rdf:about=''%3E%3Cdc:format%3Eimage/svg%2Bxml%3C/dc:format%3E%3Cdc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage' /%3E%3Cdc:title%3E%3C/dc:title%3E%3C/cc:Work%3E%3C/rdf:RDF%3E%3C/metadata%3E%3Cg inkscape:label='Layer 1' inkscape:groupmode='layer' id='layer1' transform='translate(71.41239 23.452075)'%3E%3Cg id='g882'%3E%3Cpath style='fill:%23ffffff%3Bfill-opacity:1%3Bstroke-width:0.304548' d='m 69.771557 268.34656 c -0.773245 -0.0617 -3.233544 -0.2572 -5.467342 -0.43438 -29.583004 -2.3465 -58.1236696 -12.80376 -79.859527 -29.26041 -7.058786 -5.34435 -15.65905 -13.31174 -21.060096 -19.51035 -13.551971 -15.55316 -23.598358 -34.343 -29.18963 -54.59359 -8.39909 -30.42001 -7.325712 -63.85293 2.971641 -92.558819 C -51.360625 40.006417 -29.739533 14.337384 0.23181521 -2.8833918 2.480149 -4.1752168 7.1314538 -6.5565839 10.568072 -8.1753175 27.987876 -16.380483 45.861213 -21.098571 66.959782 -23.061246 c 5.582813 -0.51934 24.36997 -0.52173 29.992256 -0.0034 36.928792 3.401757 67.906232 16.5037082 92.435882 39.095884 12.03171 11.081367 21.37937 23.346159 29.07503 38.148461 7.6967 14.804322 12.5806 30.444368 14.83592 47.510201 8.35333 63.20891 -21.32639 120.56281 -77.14335 149.07385 -18.00512 9.19695 -37.61468 14.79224 -59.672105 17.02654 -4.405356 0.44624 -23.191072 0.83775 -26.711858 0.5567 z' id='path855' /%3E%3Cpath style='fill:%23287164%3Bfill-opacity:1%3Bstroke-width:0.264583' d='m 71.588692 252.48191 c -0.65485 -0.055 -2.73844 -0.22922 -4.63021 -0.38713 -25.0534 -2.09126 -49.22406 -11.41106 -67.6318301 -26.07768 -5.97798 -4.76303 -13.2614139 -11.86379 -17.8354779 -17.38816 -11.47696 -13.86141 -19.985094 -30.60743 -24.720258 -48.65532 -7.113063 -27.11115 -6.204035 -56.90749 2.516638 -82.490967 9.716118 -28.50377 28.026695 -51.38072 53.408978 -66.72835 1.90408 -1.1513101 5.8432 -3.2736501 8.75362 -4.7163101 14.75257 -7.31267 29.88923 -11.51756 47.75729 -13.26675 4.728 -0.46285 20.63856 -0.46498 25.39999 -0.003 31.274438 3.03174 57.508768 14.70856 78.282558 34.8433301 10.18947 9.87602 18.10586 20.80674 24.6232 33.99896 6.51822 13.19402 10.65432 27.13286 12.56432 42.342397 7.07431 56.33352 -18.061 107.4489 -65.33154 132.85873 -15.24827 8.19657 -31.85531 13.18325 -50.535408 15.17452 -3.73083 0.3977 -19.64017 0.74662 -22.62187 0.49614 z' id='path847' /%3E%3Cpath style='fill:%23ffffff%3Bfill-opacity:1%3Bstroke-width:0.264583' d='m 95.136602 235.32772 c 34.023548 -4.26886 63.429038 -22.50033 81.846268 -50.74491 9.81052 -15.04535 15.53132 -30.82672 17.81848 -49.15394 0.74002 -5.92982 0.66994 -20.72269 -0.12681 -26.76938 C 192.01583 88.482073 184.80355 70.501943 173.05755 54.768573 151.40906 25.771173 118.00949 8.9580329 82.054192 8.9580329 c -22.29826 0 -43.66545 6.3308201 -62.11146 18.4028201 -6.66372 4.36107 -11.2919801 8.07913 -17.1086701 13.74406 -6.37451 6.20819 -10.757271 11.47241 -15.5297879 18.65312 -15.370132 23.12585 -21.628959 50.670667 -17.825439 78.448967 4.545135 33.19453 23.7464469 62.71876 52.506917 80.73543 15.22766 9.53919 33.27054 15.40659 51.85189 16.86183 3.24055 0.25379 18.13392 -0.0794 21.29896 -0.47654 z' id='path851' /%3E%3Crect style='fill:%23287164%3Bfill-opacity:1%3Bfill-rule:evenodd%3Bstroke:%23676261%3Bstroke-width:0.352777' id='rect867' width='21.64535' height='142.5717' x='50.998138' y='51.208988' /%3E%3Crect style='fill:%23287164%3Bfill-opacity:1%3Bfill-rule:evenodd%3Bstroke:%23676261%3Bstroke-width:0.352777' id='rect869' width='21.64535' height='142.5717' x='90.63517' y='51.208988' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
	playIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns%23' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' width='306.10342mm' height='291.8938mm' viewBox='0 0 306.10343 291.8938' version='1.1' id='svg8' inkscape:version='1.0.1 (3bc2e813f5  2020-09-07)' sodipodi:docname='play_button.svg'%3E%3Cdefs id='defs2' /%3E%3Csodipodi:namedview id='base' pagecolor='%23ffffff' bordercolor='%23666666' borderopacity='1.0' inkscape:pageopacity='0.0' inkscape:pageshadow='2' inkscape:zoom='0.35' inkscape:cx='669.90509' inkscape:cy='648.63776' inkscape:document-units='mm' inkscape:current-layer='layer1' inkscape:document-rotation='0' showgrid='false' fit-margin-top='0' fit-margin-left='0' fit-margin-right='0' fit-margin-bottom='0' inkscape:window-width='1267' inkscape:window-height='1041' inkscape:window-x='442' inkscape:window-y='6' inkscape:window-maximized='0' /%3E%3Cmetadata id='metadata5'%3E%3Crdf:RDF%3E%3Ccc:Work rdf:about=''%3E%3Cdc:format%3Eimage/svg%2Bxml%3C/dc:format%3E%3Cdc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage' /%3E%3Cdc:title%3E%3C/dc:title%3E%3C/cc:Work%3E%3C/rdf:RDF%3E%3C/metadata%3E%3Cg inkscape:label='Layer 1' inkscape:groupmode='layer' id='layer1' transform='translate(71.41239 23.452075)'%3E%3Cg id='g861'%3E%3Cpath style='fill:%23ffffff%3Bfill-opacity:1%3Bstroke-width:0.304548' d='m 69.771557 268.34656 c -0.773245 -0.0617 -3.233544 -0.2572 -5.467342 -0.43438 -29.583004 -2.3465 -58.1236696 -12.80376 -79.859527 -29.26041 -7.058786 -5.34435 -15.65905 -13.31174 -21.060096 -19.51035 -13.551971 -15.55316 -23.598358 -34.343 -29.18963 -54.59359 -8.39909 -30.42001 -7.325712 -63.85293 2.971641 -92.558819 C -51.360625 40.006417 -29.739533 14.337384 0.23181521 -2.8833918 2.480149 -4.1752168 7.1314538 -6.5565839 10.568072 -8.1753175 27.987876 -16.380483 45.861213 -21.098571 66.959782 -23.061246 c 5.582813 -0.51934 24.36997 -0.52173 29.992256 -0.0034 36.928792 3.401757 67.906232 16.5037082 92.435882 39.095884 12.03171 11.081367 21.37937 23.346159 29.07503 38.148461 7.6967 14.804322 12.5806 30.444368 14.83592 47.510201 8.35333 63.20891 -21.32639 120.56281 -77.14335 149.07385 -18.00512 9.19695 -37.61468 14.79224 -59.672105 17.02654 -4.405356 0.44624 -23.191072 0.83775 -26.711858 0.5567 z' id='path855' /%3E%3Cpath style='fill:%23287164%3Bfill-opacity:1%3Bstroke-width:0.264583' d='m 71.588692 252.48191 c -0.65485 -0.055 -2.73844 -0.22922 -4.63021 -0.38713 -25.0534 -2.09126 -49.22406 -11.41106 -67.6318301 -26.07768 -5.97798 -4.76303 -13.2614139 -11.86379 -17.8354779 -17.38816 -11.47696 -13.86141 -19.985094 -30.60743 -24.720258 -48.65532 -7.113063 -27.11115 -6.204035 -56.90749 2.516638 -82.490967 9.716118 -28.50377 28.026695 -51.38072 53.408978 -66.72835 1.90408 -1.1513101 5.8432 -3.2736501 8.75362 -4.7163101 14.75257 -7.31267 29.88923 -11.51756 47.75729 -13.26675 4.728 -0.46285 20.63856 -0.46498 25.39999 -0.003 31.274438 3.03174 57.508768 14.70856 78.282558 34.8433301 10.18947 9.87602 18.10586 20.80674 24.6232 33.99896 6.51822 13.19402 10.65432 27.13286 12.56432 42.342397 7.07431 56.33352 -18.061 107.4489 -65.33154 132.85873 -15.24827 8.19657 -31.85531 13.18325 -50.535408 15.17452 -3.73083 0.3977 -19.64017 0.74662 -22.62187 0.49614 z' id='path847' /%3E%3Cpath style='fill:%23ffffff%3Bfill-opacity:1%3Bstroke-width:0.264583' d='m 95.136602 235.32772 c 34.023548 -4.26886 63.429038 -22.50033 81.846268 -50.74491 9.81052 -15.04535 15.53132 -30.82672 17.81848 -49.15394 0.74002 -5.92982 0.66994 -20.72269 -0.12681 -26.76938 C 192.01583 88.482073 184.80355 70.501943 173.05755 54.768573 151.40906 25.771173 118.00949 8.9580329 82.054192 8.9580329 c -22.29826 0 -43.66545 6.3308201 -62.11146 18.4028201 -6.66372 4.36107 -11.2919801 8.07913 -17.1086701 13.74406 -6.37451 6.20819 -10.757271 11.47241 -15.5297879 18.65312 -15.370132 23.12585 -21.628959 50.670667 -17.825439 78.448967 4.545135 33.19453 23.7464469 62.71876 52.506917 80.73543 15.22766 9.53919 33.27054 15.40659 51.85189 16.86183 3.24055 0.25379 18.13392 -0.0794 21.29896 -0.47654 z' id='path851' /%3E%3Cpath style='fill:%23287164%3Bfill-opacity:1%3Bstroke-width:0.264583' d='M 53.597022 122.45918 V 50.934543 l 0.59531 0.53404 c 0.32743 0.29372 10.23686 8.50002 22.02097 18.23623 53.685358 44.355617 63.505588 52.513457 63.505588 52.755287 0 0.24734 -8.03957 6.93152 -61.389458 51.03981 -13.0935 10.82537 -24.01473 19.8628 -24.26939 20.08319 -0.44082 0.38149 -0.46302 -3.02896 -0.46302 -71.12392 z' id='path853' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
	editIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg aria-hidden='true' focusable='false' data-prefix='fas' data-icon='user-edit' class='svg-inline--fa fa-user-edit fa-w-20' role='img' viewBox='0 0 469.45825 469.45889' version='1.1' id='svg2408' sodipodi:docname='edit_object.svg' width='469.45825' height='469.45889' inkscape:version='1.1 (c68e22c387  2021-05-23)' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:cc='http://creativecommons.org/ns%23' xmlns:dc='http://purl.org/dc/elements/1.1/'%3E%3Cmetadata id='metadata2414'%3E%3Crdf:RDF%3E%3Ccc:Work rdf:about=''%3E%3Cdc:format%3Eimage/svg%2Bxml%3C/dc:format%3E%3Cdc:type rdf:resource='http://purl.org/dc/dcmitype/StillImage' /%3E%3C/cc:Work%3E%3C/rdf:RDF%3E%3C/metadata%3E%3Cdefs id='defs2412' /%3E%3Csodipodi:namedview pagecolor='%23ffffff' bordercolor='%23666666' borderopacity='1' objecttolerance='10' gridtolerance='10' guidetolerance='10' inkscape:pageopacity='0' inkscape:pageshadow='2' inkscape:window-width='1920' inkscape:window-height='1057' id='namedview2410' showgrid='false' fit-margin-top='0' fit-margin-left='0' fit-margin-right='0' fit-margin-bottom='0' inkscape:zoom='1.0671875' inkscape:cx='119.47291' inkscape:cy='314.37775' inkscape:window-x='-8' inkscape:window-y='-8' inkscape:window-maximized='1' inkscape:current-layer='svg2408' inkscape:pagecheckerboard='0' /%3E%3Cg id='g1951' transform='translate(151.80087 116.19326)'%3E%3Cellipse style='fill:%23ffffff%3Bstroke-width:85.1032%3Bstroke-linecap:round' id='circle1266' cx='82.928253' cy='118.53619' rx='234.72913' ry='234.72945' /%3E%3Ccircle style='fill:%23287164%3Bfill-opacity:1%3Bstroke-width:75.5906%3Bstroke-linecap:round' id='path1142' cx='82.928253' cy='118.53619' r='208.49194' /%3E%3Ccircle style='fill:%23ffffff%3Bstroke-width:62.8506%3Bstroke-linecap:round' id='circle1242' cx='82.928253' cy='118.53619' r='173.35284' /%3E%3Cpath style='fill:%23287164%3Bfill-opacity:1%3Bstroke:none%3Bstroke-width:70.8316%3Bstroke-linecap:round' d='M 127.66222 73.78238 101.19688 47.304819 117.83124 30.715271 c 10.46176 -10.43358 17.92711 -17.124122 20.11817 -18.030155 4.33432 -1.792307 9.24236 -1.840864 13.17878 -0.130384 3.84339 1.670052 36.80107 34.828102 38.10914 38.340823 1.46951 3.946272 1.15447 9.088196 -0.81439 13.291853 -1.0649 2.273643 -8.1561 10.106362 -18.02545 19.910353 l -16.26993 16.162179 z' id='path1512' /%3E%3Cpath style='fill:%23287164%3Bfill-opacity:1%3Bstroke:none%3Bstroke-width:70.8316%3Bstroke-linecap:round' d='m -20.725174 222.18931 c -4.445141 -4.44515 -4.406122 -3.33678 -1.131625 -32.14485 l 2.522892 -22.19567 51.365904 -51.35954 51.365906 -51.359531 26.468257 26.468254 26.46825 26.468257 -51.35387 51.36023 -51.353867 51.36024 -22.669852 2.54649 c -12.4684185 1.40058 -23.87905 2.5347 -25.356959 2.52027 -1.850585 -0.0181 -3.819629 -1.15875 -6.325036 -3.66415 z' id='path1551' /%3E%3C/g%3E%3C/svg%3E",
	deleteImg = document.createElement('img'),
	cloneImg = document.createElement('img'),
	playImg = document.createElement('img'),
	pauseImg = document.createElement('img'),
	editImg = document.createElement('img');

playImg.src = playIcon;
pauseImg.src = pauseIcon;
deleteImg.src = deleteIcon;
cloneImg.src = duplicateIcon;
editImg.src = editIcon;

const animationDelay = 250; //anti-rebound
let lastAnimation = 0;

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function addZero(i) {
	if (i < 10) { i = "0" + i }
	return i;
}

function showUpdatedPDF() {
	// $("#pdf-loader").show();
	pdfjsLib.getDocument({ data: __EXISTING_PDF_BYTES }).promise.then(function (pdf_doc) {
		__PDF_DOC = pdf_doc;
		__TOTAL_PAGES = __PDF_DOC.numPages;
		// Hide the pdf loader and show pdf container in HTML
		$("#pdf-loader").hide();
		$("#pdf-contents").show();
		$("#pdf-total-pages").text(__TOTAL_PAGES);

		// Show the first page
		showPage(1);
	}).catch(function (error) {
		// If error re-show the upload button
		$("#pdf-loader").hide();
		$("#upload-button").show();

		alert(error.message);
	});;
}

function showSelectedPDF(pdf_url) {
	$("#pdf-loader").show();
	pdfjsLib.getDocument({ url: pdf_url }).promise.then(function (pdf_doc) {
		__PDF_DOC = pdf_doc;
		__TOTAL_PAGES = __PDF_DOC.numPages;
		__PDF_DOC.getData().then(function (pdf_data) {
			__EXISTING_PDF_BYTES = pdf_data;
		});
		// Hide the pdf loader and show pdf container in HTML
		$("#pdf-loader").hide();
		$("#pdf-contents").show();
		$("#pdf-total-pages").text(__TOTAL_PAGES);

		// Show the first page
		showPage(1);
	}).catch(function (error) {
		// If error re-show the upload button
		$("#pdf-loader").hide();
		$("#upload-button").show();

		alert(error.message);
	});;
}

function highlightText() {
	__HIGHLIGHT_MODE = true;
	__REMOVE_MODE = false;
	__FABRIC_CANVAS.defaultCursor = 'default';
	__FABRIC_CANVAS.moveCursor = 'move';
	__FABRIC_CANVAS.hoverCursor = 'move';
	__FABRIC_CANVAS.discardActiveObject().renderAll();
	__FABRIC_CANVAS.selection = false;
	var textLayer = document.getElementById("text-layer");
	textLayer.style["z-index"] = 1;
	document.getElementById("highlight-mode-button").classList.add("active_button");
	document.getElementById("remove-mode-button").classList.remove("active_button");
}

function removeObjects() {
	__REMOVE_MODE = true;
	__HIGHLIGHT_MODE = false;
	__FABRIC_CANVAS.defaultCursor = 'url("https://support.wirelessmessaging.com/temp/icon-eraser.png"), auto';
	__FABRIC_CANVAS.moveCursor = 'url("https://support.wirelessmessaging.com/temp/icon-eraser.png"), auto';
	__FABRIC_CANVAS.hoverCursor = 'url("https://support.wirelessmessaging.com/temp/icon-eraser.png"), auto';
	__FABRIC_CANVAS.discardActiveObject().renderAll();
	__FABRIC_CANVAS.selection = false;
	var textLayer = document.getElementById("text-layer");
	textLayer.style["z-index"] = -1;
	document.getElementById("highlight-mode-button").classList.remove("active_button");
	document.getElementById("remove-mode-button").classList.add("active_button");
}

function defaultMode() {
	__REMOVE_MODE = false;
	__HIGHLIGHT_MODE = false;
	__FABRIC_CANVAS.defaultCursor = 'default';
	__FABRIC_CANVAS.moveCursor = 'move';
	__FABRIC_CANVAS.hoverCursor = 'move';
	__FABRIC_CANVAS.selection = true;
	var textLayer = document.getElementById("text-layer");
	textLayer.style["z-index"] = -1;
	document.getElementById("highlight-mode-button").classList.remove("active_button");
	document.getElementById("remove-mode-button").classList.remove("active_button");
}

function animationScaleObject(object, scale) {
	// queues up the animations for an object
	if ((lastAnimation + animationDelay) < Date.now()) {
		var scaleX = object.scaleX;
		var scaleY = object.scaleY;
		var tempScaleX = scaleX * scale;
		var tempScaleY = scaleY * scale;
		var animationQueue = [
			{ "scaleX": tempScaleX, "scaleY": tempScaleY, "duration": 100 },
			{ "scaleX": scaleX, "scaleY": scaleY, "duration": 100 }
		];

		var runningDuration = 0; // variable that adds up the animationQueue durations
		for (var i = 0; i < 2; i++) {
			var animationDefinition = animationQueue[i];

			// Create a closure around the animationDefiniton so that each setTimeout gets sequential animationDefinition inputs
			var fn = (function (animationDefinition) {
				return function () {
					object.animate('scaleX', animationDefinition.scaleX, { duration: animationDefinition.duration, onChange: __FABRIC_CANVAS.renderAll.bind(__FABRIC_CANVAS) })
					object.animate('scaleY', animationDefinition.scaleY, { duration: animationDefinition.duration, onChange: __FABRIC_CANVAS.renderAll.bind(__FABRIC_CANVAS) })
					// Note: you can animate additional attributes here if you want, just add additional attributes to the objects in
					//   the animationQueue list. You could also have one of those inputs be the object to be animated in case you want
					//   to animate multiple objects using the same queue.
				};
			})

			// Create the timeout that will apply the transformations sequentially
			// If you want you could set the window.setTimeout to a variable that you could destroy if you need 
			// to interrupt the animation queue after you create it (but before it finishes)
			window.setTimeout(fn(animationDefinition), runningDuration);

			// set the next setTimeout duration to be .duration later than the previous one
			// this makes the second animation fire after the first one completes
			runningDuration += animationDefinition.duration;
		}
		lastAnimation = Date.now()
	}
}

function addCircleAnnotation() {
	defaultMode();
	console.log("Adding circle annotation")
	var textLayer = document.getElementById("text-layer");
	textLayer.style["z-index"] = -1;
	var circle = new fabric.Circle({
		id: "answer",
		radius: 12,
		left: (__CANVAS.width / 2) - 30,
		top: 150,
		stroke: '#F44336',
		fill: 'rgba(0,0,0,0)',
		strokeWidth: 3,
		objectCaching: false,
		originX: "center",
		originY: "center"
		// centeredScaling: true
	});
	// preserve aspect ratio
	circle.setControlsVisibility({
		mt: false, // middle top 
		mb: false, // midle bottom
		ml: false, // middle left
		mr: false, // middle right
		tl: true, // top left
		tr: true, // top right
		bl: true, // bottom left
		br: true, // bottom right
		mtr: false, // rotation
		pause: false, // pause
		play: false, // play
		edit: true // edit
	});
	// console.log("adding answer element" + JSON.stringify(circle));	
	__FABRIC_CANVAS.add(circle);
	__FABRIC_CANVAS.setActiveObject(circle);
	circle.on('mouseover', function (opt) {
		var mouseevent = opt.e;
		animationScaleObject(circle, 1.2);
		if (this.__corner === 0) {
			console.log("object hover event");
		};
		if (this.__corner === 'edit') {
			console.log("edit corner hover event");
		};
	});
	circle.on('mousedown', function (opt) {
		var mouseevent = opt.e;
		mouseevent.preventDefault();
		let obj = opt.target;
		if (__REMOVE_MODE) {
			mouseevent.stopPropagation();
			__FABRIC_CANVAS.remove(obj);
			__FABRIC_CANVAS.requestRenderAll()
			console.log("answer removed");
		}
	});
}

function addCircleAnnotation(number) {
	defaultMode();
	console.log("Adding circle annotation");

	var textLayer = document.getElementById("text-layer");
	textLayer.style["z-index"] = -1;

	// Create the circle
	var circle = new fabric.Circle({
		id: "answer",
		radius: 12,
		left: (__CANVAS.width / 2) - 30,
		top: 150,
		stroke: 'none',
		fill: 'blue',
		strokeWidth: 1,
		objectCaching: false,
		originX: "center",
		originY: "center"
	});

	// Create the text (number)
	var text = new fabric.Text(number.toString(), {
		fontSize: 14,
		left: circle.left - (number.toString().length * 3), // Adjust the text position based on its length
		top: circle.top - 7, // Position the text to be centered inside the circle
		originX: 'center',
		originY: 'center',
		fill: '#F44336'
	});

	// Group the circle and text together so they move as one
	var group = new fabric.Group([circle, text], {
		left: circle.left,
		top: circle.top,
		originX: 'center',
		originY: 'center'
	});

	// Set controls visibility for the group
	group.setControlsVisibility({
		mt: false, // middle top 
		mb: false, // middle bottom
		ml: false, // middle left
		mr: false, // middle right
		tl: true, // top left
		tr: true, // top right
		bl: true, // bottom left
		br: true, // bottom right
		mtr: false, // rotation
		pause: false, // pause
		play: false, // play
		edit: true // edit
	});

	// Add the group to the canvas
	__FABRIC_CANVAS.add(group);
	__FABRIC_CANVAS.setActiveObject(group);

	// Hover event for the circle
	group.on('mouseover', function (opt) {
		var mouseevent = opt.e;
		animationScaleObject(group, 1.2);
		if (this.__corner === 0) {
			console.log("object hover event");
		}
		if (this.__corner === 'edit') {
			console.log("edit corner hover event");
		}
	});

	// Mouse down event to remove the group if in remove mode
	group.on('mousedown', function (opt) {
		var mouseevent = opt.e;
		mouseevent.preventDefault();
		let obj = opt.target;
		if (__REMOVE_MODE) {
			mouseevent.stopPropagation();
			__FABRIC_CANVAS.remove(obj);
			__FABRIC_CANVAS.requestRenderAll();
			console.log("answer removed");
		}
	});
}

function addCross() {
	defaultMode();

	var textLayer = document.getElementById("text-layer");
	textLayer.style["z-index"] = -1;

	// Create the cross lines (X shape)
	var line1 = new fabric.Line([__CANVAS.width / 2 - 12, 150 - 12, __CANVAS.width / 2 + 12, 150 + 12], {
		stroke: '#F44336',
		strokeWidth: 2,
		selectable: false
	});

	var line2 = new fabric.Line([__CANVAS.width / 2 - 12, 150 + 12, __CANVAS.width / 2 + 12, 150 - 12], {
		stroke: '#F44336',
		strokeWidth: 2,
		selectable: false
	});

	// Group the lines together
	var group = new fabric.Group([line1, line2], {
		left: __CANVAS.width / 2,
		top: 150,
		originX: 'center',
		originY: 'center'
	});

	// Set controls visibility for the group
	group.setControlsVisibility({
		mt: false, // middle top 
		mb: false, // middle bottom
		ml: false, // middle left
		mr: false, // middle right
		tl: true, // top left
		tr: true, // top right
		bl: true, // bottom left
		br: true, // bottom right
		mtr: false, // rotation
		pause: false, // pause
		play: false, // play
		edit: true // edit
	});

	// Add the group to the canvas
	__FABRIC_CANVAS.add(group);
	__FABRIC_CANVAS.setActiveObject(group);

	// Hover event for the group
	group.on('mouseover', function (opt) {
		var mouseevent = opt.e;
		animationScaleObject(group, 1.2);
		if (this.__corner === 0) {
			console.log("object hover event");
		}
		if (this.__corner === 'edit') {
			console.log("edit corner hover event");
		}
	});

	// Mouse down event to remove the group if in remove mode
	group.on('mousedown', function (opt) {
		var mouseevent = opt.e;
		mouseevent.preventDefault();
		let obj = opt.target;
		if (__REMOVE_MODE) {
			mouseevent.stopPropagation();
			__FABRIC_CANVAS.remove(obj);
			__FABRIC_CANVAS.requestRenderAll();
			console.log("cross removed");
		}
	});
}

function addCheck() {
	defaultMode();
  
	var textLayer = document.getElementById("text-layer");
	textLayer.style["z-index"] = -1;
  
	// Create the check symbol (✔) using fabric.Text
	var checkSymbol = new fabric.Text('✔', {
	  fontSize: 24,
	  left: __CANVAS.width / 2 - 10, // Adjust the position of the check mark
	  top: 150 - 10, // Position it vertically
	  originX: 'center',
	  originY: 'center',
	  fill: '#4CAF50', // Green color for the check mark
	  selectable: false
	});
  
  
	// Set controls visibility for the group
	checkSymbol.setControlsVisibility({
	  mt: false, // middle top 
	  mb: false, // middle bottom
	  ml: false, // middle left
	  mr: false, // middle right
	  tl: true, // top left
	  tr: true, // top right
	  bl: true, // bottom left
	  br: true, // bottom right
	  mtr: false, // rotation
	  pause: false, // pause
	  play: false, // play
	  edit: true // edit
	});
  
	// Add the group to the canvas
	__FABRIC_CANVAS.add(checkSymbol);
	__FABRIC_CANVAS.setActiveObject(checkSymbol);
  
	// Hover event for the group
	checkSymbol.on('mouseover', function (opt) {
	  var mouseevent = opt.e;
	  animationScaleObject(checkSymbol, 1.2);
	  if (this.__corner === 0) {
		console.log("object hover event");
	  }
	  if (this.__corner === 'edit') {
		console.log("edit corner hover event");
	  }
	});
  
	// Mouse down event to remove the group if in remove mode
	checkSymbol.on('mousedown', function (opt) {
	  var mouseevent = opt.e;
	  mouseevent.preventDefault();
	  let obj = opt.target;
	  if (__REMOVE_MODE) {
		mouseevent.stopPropagation();
		__FABRIC_CANVAS.remove(obj);
		__FABRIC_CANVAS.requestRenderAll();
		console.log("cross and check removed");
	  }
	});
  }
  




function addCircleAnnotations(qty) {
	defaultMode();
	console.log("Adding " + qty + " circle annotations");
	var textLayer = document.getElementById("text-layer");
	textLayer.style["z-index"] = -1;

	for (let i = 1; i <= qty; i++) {
		let circle = new fabric.Circle({
			id: "answer",
			name: i,
			radius: 12,
			left: (__CANVAS.width / 2 - 30),
			top: 150 + (32 * i - 1),
			stroke: '#F44336',
			fill: 'rgba(0,0,0,0)',
			strokeWidth: 3,
			objectCaching: false,
			originX: "center",
			originY: "center"
		});
		// preserve aspect ratio
		circle.setControlsVisibility({
			mt: false, // middle top 
			mb: false, // midle bottom
			ml: false, // middle left
			mr: false, // middle right
			tl: true, //top left
			tr: true, //top right
			bl: true, //bottom left
			br: true, //bottom right
			mtr: false, //rotation
			pause: false, //pause
			play: false, //play
			edit: true // edit
		});
		__FABRIC_CANVAS.add(circle);
		__FABRIC_CANVAS.setActiveObject(circle);
		circle.on('mouseover', function (opt) {
			var mouseevent = opt.e;
			if (this.__corner === 0) {
				console.log("object hover event");
			};
			if (this.__corner === 'edit') {
				console.log("edit corner hover event");
			};
			animationScaleObject(circle, 1.2);
		});
		circle.on('mousedown', function (opt) {
			var mouseevent = opt.e;
			mouseevent.preventDefault();
			let obj = opt.target;
			if (__REMOVE_MODE) {
				mouseevent.stopPropagation();
				__FABRIC_CANVAS.remove(obj);
				__FABRIC_CANVAS.requestRenderAll()
			}
			console.log("answer removed");
		});
	};
	var objects = __FABRIC_CANVAS.getObjects();
	var lastObjects = objects.slice(-4);
	__FABRIC_CANVAS.discardActiveObject();
	var sel = new fabric.ActiveSelection(lastObjects, {
		canvas: __FABRIC_CANVAS,
	});
	__FABRIC_CANVAS.setActiveObject(sel);
	__FABRIC_CANVAS.requestRenderAll();
}

function addTextAnnotation() {
	defaultMode();
	console.log("Adding text annotation")
	var textLayer = document.getElementById("text-layer");
	textLayer.style["z-index"] = -1;

	var text = new fabric.IText('hello world', {
		id: "text",
		left: 50,
		top: 50,
		objectCaching: false,
		lockUniScaling: true
	});
	text.setControlsVisibility({
		mt: false, // middle top 
		mb: false, // midle bottom
		ml: false, // middle left
		mr: false, // middle right
		tl: true, //top left
		tr: true, //top right
		bl: true, //bottom left
		br: true, //bottom right
		mtr: false, //rotation
		clone: true, //clone
		delete: true, //delete
		pause: false, //pause
		play: false, //play
		edit: false // edit
	});
	__FABRIC_CANVAS.add(text);
	__FABRIC_CANVAS.setActiveObject(text);
	text.on('mouseover', function (opt) {
		animationScaleObject(circle, 1.05);
	});
	text.on('mousedown', function (opt) {
		var mouseevent = opt.e;
		mouseevent.preventDefault();
		let obj = opt.target;
		if (__REMOVE_MODE) {
			mouseevent.stopPropagation();
			__FABRIC_CANVAS.remove(obj);
			__FABRIC_CANVAS.requestRenderAll()
		}
		console.log("text removed");
	});
};

function renderIcon(icon) {
	return function renderIcon(ctx, left, top, styleOverride, fabricObject) {
		var size = this.cornerSize;
		ctx.save();
		ctx.translate(left, top);
		ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
		ctx.drawImage(icon, -size / 2, -size / 2, size, size);
		ctx.restore();
	}
}

__FABRIC_CANVAS.on({
	'selection:updated': HandleElement,
	'selection:created': HandleElement
});

function HandleElement(obj) {
	//Handle the object here 
	var sel = __FABRIC_CANVAS.getActiveObject();
	var sel_type = __FABRIC_CANVAS.getActiveObject().type;
	var id = __FABRIC_CANVAS.getActiveObject().id;
	if (id != "answer" && id != "text" && id != "video") {
		sel.setControlsVisibility({
			mt: false, // middle top 
			mb: false, // midle bottom
			ml: false, // middle left
			mr: false, // middle right
			tl: true, //top left
			tr: true, //top right
			bl: true, //bottom left
			br: true, //bottom right
			mtr: false, //rotation
			clone: false, //clone
			delete: false, //delete
			pause: false, //pause
			play: false, //play
			edit: false, // edit
		});
		__FABRIC_CANVAS.requestRenderAll();
	};
}

fabric.Object.prototype.controls.edit = new fabric.Control({
	x: 0.5,
	y: 0.5,
	offsetY: 16,
	offsetX: 16,
	cursorStyle: 'pointer',
	mouseUpHandler: editObject,
	render: renderIcon(editImg),
	cornerSize: 24
});

fabric.Object.prototype.controls.delete = new fabric.Control({
	x: 0.5,
	y: -0.5,
	offsetY: -16,
	offsetX: 16,
	cursorStyle: 'pointer',
	mouseUpHandler: removeObject,
	render: renderIcon(deleteImg),
	cornerSize: 24
});

fabric.Object.prototype.controls.clone = new fabric.Control({
	x: -0.5,
	y: -0.5,
	offsetY: -16,
	offsetX: -16,
	cursorStyle: 'pointer',
	mouseUpHandler: cloneObject,
	render: renderIcon(cloneImg),
	cornerSize: 24
});

fabric.Object.prototype.controls.play = new fabric.Control({
	x: -0.5,
	y: 0.5,
	offsetY: 16,
	offsetX: 16,
	cursorStyle: 'pointer',
	mouseUpHandler: playVideo,
	render: renderIcon(playImg),
	cornerSize: 24
});

fabric.Object.prototype.controls.pause = new fabric.Control({
	x: 0.5,
	y: 0.5,
	offsetY: 16,
	offsetX: -16,
	cursorStyle: 'pointer',
	mouseUpHandler: pauseVideo,
	render: renderIcon(pauseImg),
	cornerSize: 24
});

function playVideo(eventData, transform) {
	var target = transform.target;
	var canvas = target.canvas;
	var video1El = document.getElementById('video1');
	video1El.pause();
	video1El.currentTime = 0;
	video1El.play();
	fabric.util.requestAnimFrame(function render() {
		__FABRIC_CANVAS.renderAll();
		fabric.util.requestAnimFrame(render);
	});
}

function pauseVideo(eventData, transform) {
	var target = transform.target;
	var canvas = target.canvas;
	var video1El = document.getElementById('video1');
	video1El.pause();
}

function editObject(eventData, transform) {
	var target = transform.target;
	var canvas = target.canvas;
	console.log("Edit Object event");
}

function removeObject(eventData, transform) {
	var target = transform.target;
	var canvas = target.canvas;
	canvas.remove(target);
	canvas.requestRenderAll();
}

function cloneObject(eventData, transform) {
	var target = transform.target;
	var canvas = target.canvas;
	if (target.id == "answer") {
		var circle = new fabric.Circle({
			id: "answer",
			radius: 12,
			left: target.left,
			top: target.top + 40,
			stroke: '#F44336',
			fill: 'rgba(0,0,0,0)',
			strokeWidth: 3,
			objectCaching: false,
			originX: "center",
			originY: "center"
		});
		// preserve aspect ratio
		circle.setControlsVisibility({
			mt: false, // middle top 
			mb: false, // midle bottom
			ml: false, // middle left
			mr: false, // middle right
			tl: true, //top left
			tr: true, //top right
			bl: true, //bottom left
			br: true, //bottom right
			mtr: false, //rotation
			pause: false, //pause
			play: false, //play
			edit: true // edit
		});
		canvas.add(circle);
		canvas.setActiveObject(circle);
		circle.on('mouseover', function (opt) {
			var mouseevent = opt.e;
			if (this.__corner === 0) {
				console.log("object hover event");
			};
			if (this.__corner === 'edit') {
				console.log("edit corner hover event");
			};
			animationScaleObject(circle, 1.2);
		});
		circle.on('mousedown', function (opt) {
			var mouseevent = opt.e;
			mouseevent.preventDefault();
			let obj = opt.target;
			if (__REMOVE_MODE) {
				mouseevent.stopPropagation();
				__FABRIC_CANVAS.remove(obj);
				__FABRIC_CANVAS.requestRenderAll()
			}
			console.log("answer removed");
		});
	}
	if (target.id == "text") {
		var text = new fabric.IText('hello world', {
			id: "text",
			left: target.left,
			top: target.top + 80,
			objectCaching: false,
			lockUniScaling: true
		});
		// preserve aspect ratio
		text.setControlsVisibility({
			mt: false, // middle top 
			mb: false, // midle bottom
			ml: false, // middle left
			mr: false, // middle right
			tl: true, //top left
			tr: true, //top right
			bl: true, //bottom left
			br: true, //bottom right
			mtr: false, //rotation
			clone: true, //clone
			delete: true, //delete
			pause: false, //pause
			play: false, //play
			edit: false // edit
		});
		canvas.add(text);
		canvas.setActiveObject(text);
		text.on('mouseover', function (opt) {
			animationScaleObject(circle, 1.1);
		});
		text.on('mousedown', function (opt) {
			var mouseevent = opt.e;
			mouseevent.preventDefault();
			let obj = opt.target;
			if (__REMOVE_MODE) {
				mouseevent.stopPropagation();
				__FABRIC_CANVAS.remove(obj);
				__FABRIC_CANVAS.requestRenderAll()
			}
			/* console.log("text removed") */;
		});
	}
}

/**
 * Non-unique attributes
 */
fabric.Canvas.prototype.getItemsByAttr = function (attr, val) {
	var objectList = [];
	traverseObjects(this.getObjects(), attr, val, objectList);
	return objectList;
};

/**
 * Unique attribute
 */
fabric.Canvas.prototype.getItemByAttr = function (attr, val) {
	var objectList = [];
	traverseObjects(this.getObjects(), attr, val, objectList);
	return objectList[0];
};

/**
 * Traverse objects in groups (and subgroups)
 */
function traverseObjects(objects, attr, val, objectList) {
	for (i in objects) {
		if (objects[i]['type'] == 'group') {
			traverseObjects(objects[i].getObjects(), attr, val, objectList);
		} else if (objects[i][attr] == val) {
			objectList.push(objects[i]);
		}
	}
}

function showPage(page_no) {
	// console.log("showPage called");
	__PAGE_RENDERING_IN_PROGRESS = 1;
	__CURRENT_PAGE = page_no;

	// Disable Prev & Next buttons while page is being loaded
	$("#pdf-next, #pdf-prev").attr('disabled', 'disabled');

	// While page is being rendered hide the canvas & annotayion layer and show a loading message
	$("#pdf-canvas").hide();
	$("#annotation-layer").hide();
	$("#text-layer").hide();
	$("#canvasContainer").hide();
	$("#page-loader").show();

	// Update current page in HTML
	$("#pdf-current-page").text(page_no);

	// Fetch the page
	__PDF_DOC.getPage(page_no).then(function (page) {
		// As the canvas is of a fixed width we need to set the scale of the viewport accordingly
		var scale_required = __CANVAS.width / page.getViewport({ scale: 1 }).width;
		// Get viewport of the page at required scale
		var viewport = page.getViewport({ scale: scale_required });
		__VIEWPORT = viewport;
		// Set canvas height
		__CANVAS.height = viewport.height;

		var renderContext = {
			canvasContext: __CANVAS_CTX,
			viewport: viewport
		};

		// Render the page contents in the canvas
		page.render(renderContext).promise.then(function () {
			__PAGE_RENDERING_IN_PROGRESS = 0;

			// Re-enable Prev & Next buttons
			$("#pdf-next, #pdf-prev").removeAttr('disabled');

			// Show the canvas and hide the page loader
			$("#pdf-canvas").show();
			$("#page-loader").hide();

			return page.getTextContent();
		}).then(function (textContent) {

			var textLayer = new pdfjsLib.renderTextLayer({
				container: $("#text-layer").get(0),
				pageIndex: page.pageIndex,
				viewport: viewport,
				textContent: textContent
			});

			// Get canvas offset
			var canvas_offset = $("#pdf-canvas").offset();

			// Clear HTML for text layer and show
			$("#text-layer").html('').show();

			// Assign the CSS created to the text-layer element

			$("#text-layer").css({ left: canvas_offset.left + 'px', top: canvas_offset.top + 'px', height: __CANVAS.height + 'px', width: __CANVAS.width + 'px' });

			// Return annotation data of the page after the pdf has been rendered in the canvas
			return page.getAnnotations();
		}).then(function (annotationData) {
			// Get canvas offset
			var canvas_offset = $("#pdf-canvas").offset();

			// Clear HTML for annotation layer and show
			$("#annotation-layer").html('').show();

			// Assign the CSS created to the annotation-layer element
			$("#annotation-layer").css({ left: canvas_offset.left + 'px', top: canvas_offset.top + 'px', height: __CANVAS.height + 'px', width: __CANVAS.width + 'px' });

			pdfjsLib.AnnotationLayer.render({
				viewport: viewport.clone({ dontFlip: true }),
				div: $("#annotation-layer").get(0),
				annotations: annotationData,
				page: page
			});

			// Clear HTML for fabric layer and show
			$("#canvasContainer").show();

			$("#canvasContainer").css({ left: canvas_offset.left + 'px', top: canvas_offset.top + 'px', height: __CANVAS.height + 'px', width: __CANVAS.width + 'px', position: 'absolute' });
			// console.log("setting fabric canvas height/width");

			__FABRIC_CANVAS.setHeight(__CANVAS.height);
			__FABRIC_CANVAS.setWidth(__CANVAS.width);
			// console.log("set fabric canvas height to: " + __FABRIC_CANVAS.height);
		});
	});
}

// Upon click this should should trigger click on the #file-to-upload file input element
// This is better than showing the not-good-looking file input element
$("#upload-button").on('click', function () {
	$("#file-to-upload").trigger('click');
});

$("#new-upload-button").on('click', function () {
	$("#file-to-upload").trigger('click');
});

// When user chooses Remove Mode button
$("#remove-mode-button").on('click', function () {
	if (__REMOVE_MODE) {
		defaultMode();
	} else {
		removeObjects();
	}
});

// When user chooses Highlight button
$("#highlight-mode-button").on('click', function () {
	if (__HIGHLIGHT_MODE) {
		defaultMode();
	} else {
		highlightText();
	}
});

// When user chooses Add Circle button
$("#add-circle-button").on('click', function () {
	addCircleAnnotation();
});

// When user chooses Add 4 Circles button
$("#add-4-circles-button").on('click', function () {
	addCircleAnnotations(4);
});

// When user chooses Add Text button
$("#add-text-button").on('click', function () {
	addTextAnnotation();
});

// When user chooses Add Video button
$("#add-video-button").on('click', function () {
	addVideoAnnotation();
});

// When user chooses Annotate PDF button
$("#annotate-pdf-button").on('click', function () {
	modifyPdf();
});

// When user chooses Save PDF button
$("#save-pdf-button").on('click', function () {
	savePdf();
});

// When user chooses a PDF file
$("#file-to-upload").on('change', function () {
	// Validate whether PDF
	if (['application/pdf'].indexOf($("#file-to-upload").get(0).files[0].type) == -1) {
		alert('Error : Not a PDF');
		return;
	}

	$("#upload-button").hide();

	// Send the object url of the pdf
	showSelectedPDF(URL.createObjectURL($("#file-to-upload").get(0).files[0]));
	// Show the first page
});

$("#first-page-button").on('click', function () {
	showPage(1);
});

// Previous page of the PDF
$("#pdf-prev").on('click', function () {
	if (__CURRENT_PAGE != 1)
		showPage(--__CURRENT_PAGE);
});

// Next page of the PDF
$("#pdf-next").on('click', function () {
	if (__CURRENT_PAGE != __TOTAL_PAGES)
		showPage(++__CURRENT_PAGE);
});

var resizeHandler = debounce(() => {
	if (__CURRENT_PAGE != null) {
		this.showPage(__CURRENT_PAGE);
	};
}, 400);

window.addEventListener('resize', resizeHandler);

function debounce(func, timeout = 250) {
	console.log("debounce called");
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => { func.apply(this, args); }, timeout);
	};
}

window.addEventListener('mouseup', function () {
	var length = window.getSelection().toString().length;
	if (length > 0) {
		showHighlight();
	};
});

function showHighlight() {
	var selection = getSelectionCoords();
	var rect = selection.coords;
	// use page to add to proper canvas
	var page = selection.page;
	var canvas_offset = $("#pdf-canvas").offset();
	var bounds = __VIEWPORT.convertToViewportRectangle(rect);
	var x1 = Math.min(bounds[0], bounds[2]) - canvas_offset.left + __SCROLL_X;
	var y1 = Math.min(bounds[1], bounds[3]) - canvas_offset.top + __SCROLL_Y;
	var width = Math.abs(bounds[0] - bounds[2]);
	var height = Math.abs(bounds[1] - bounds[3]);
	var rectangle = new fabric.Rect({
		width: width,
		height: height,
		fill: 'rgba(77,166,255,0.3)',
		top: y1,
		left: x1,
		selectable: false
	});
	__FABRIC_CANVAS.add(rectangle);
	window.getSelection().removeAllRanges();
	rectangle.on('mousedown', function (opt) {
		var mouseevent = opt.e;
		mouseevent.preventDefault();
		let obj = opt.target;
		if (__REMOVE_MODE) {
			mouseevent.stopPropagation();
			__FABRIC_CANVAS.remove(obj);
			__FABRIC_CANVAS.requestRenderAll()
		}
		/* console.log("rectangle removed") */;
	});
}

window.addEventListener("scroll", function (event) {
	__SCROLL_Y = this.scrollY,
		__SCROLL_X = this.scrollX;
}, false);

function getSelectionCoords() {
	var pageRect = __CANVAS.getClientRects()[0];
	var selectionRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
	var selectedRect = __VIEWPORT.convertToPdfPoint(selectionRect.left, selectionRect.top).concat(__VIEWPORT.convertToPdfPoint(selectionRect.right, selectionRect.bottom));
	return { page: __CURRENT_PAGE, coords: selectedRect };
}
