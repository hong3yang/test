$(function() {
	mui.init();
	mui.plusReady(function() {
		defineBgColor();
		var self = plus.webview.currentWebview();
		var data = self.data;
		f_get_AttchMent(data);
	});
});

function f_get_AttchMent(data) {
	var parms;
	if(data.oData != null) {
		parms = {
			"companyid": plus.storage.getItem("companyID"),
			"templetid": data.exdata.templetid,
			"info_id": data.exdata.id,
			"review_id_main": data.oData.id,
			"review_id": data.oData.review_id,
			"Linces": Linces
		};
	} else {
		parms = {
			"companyid": plus.storage.getItem("companyID"),
			"templetid": data.exdata.templetid,
			"info_id": data.exdata.id,
			"review_id_main": "-1",
			"review_id": "-1",
			"Linces": Linces
		};
	}
	$.post(Service_url + "efwebservice_oa.asmx/Get_OA_AttchMent", parms, function(data) {
		var jdata = eval("(" + data + ")");
		if(jdata != null && jdata.Table.length > 0) { 
			$(".mui-content").empty();
			$.each(jdata.Table, function(i, o) {
				$(".mui-content").append(f_showImg(o));
			});
		}
	});
}

function f_showImg(o) {
	var div0 = $("<div/>", {
		"class": "mui-card"
	});
	var div2 = $("<div/>", {
		"class": "mui-card-content"
	});
	var img0 = $("<img/>", {
		"src": OSS_jyou_url + "/" + o.attch_path,
		"style": "width:100%;"
	});

	var div3 = $("<div/>", {
		"class": "mui-card-content-inner"
	});
	var p0 = $("<p/>", {
		"html": o.attch_time
	});
	var p1 = $("<p/>", {
		"style": "color: #333;",
		"html": o.attch_name
	});
	var p2 = $("<p/>", {
		"style": "color: #333;",
		"html": o.attch_formataddress
	});
	div3.append(p0).append(p1).append(p2);
	div2.append(img0).append(div3);
	var div4 = $("<div/>", {
		"class": "mui-card-footer"
	});
	var a0 = $("<a/>", {
		"class": "mui-card-link",
		"html": "下载"
	});
	a0.on("tap", function() {
		var uri = OSS_jyou_url + "/" + o.attch_path;
		plus.downloader.createDownload(uri, {}, function(d, status) {
			if(status == 200) {
				plus.nativeUI.alert("下载成功" + d.filename, null, "提示信息");
			}
		}).start();
	});

	div4.append(a0);
	div0.append(div2).append(div4);
	return div0;
}