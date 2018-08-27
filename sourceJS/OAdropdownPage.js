mui.init();
mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	defineBgColor();
	exdata = self.data;
	var uri = self.uri;
	//uri = "http://ef.fstorch.com/efwebservice_oa.asmx/GET_DROPDOWN_SZXM?companyid=20161227C000001&Linces=fstorch";
	f_loadData(uri);
	$("#btnquery").bind("tap", function() {
		f_loadData(uri);
	});
});
var exdata = null;

function f_loadData(uri) {
	$.get(uri, {
		"query": $("#ipt_query").val()
	}, function(data) {
		var jdata = eval("(" + data + ")");
		if(jdata) {
			f_showItem(jdata);
		} else {
			$("#content").empty();
			var li = $("<li/>", {
				"html": "暂无信息",
				"class": "mui-table-view-cell",
				"style":"text-align:center;" 
			});
			$("#content").append(li);
		}
	});
}

function f_showItem(jdata) {
	$("#content").empty();
	$.each(jdata, function(i, o) {
		var li = $("<li/>", {
			"data-value": o.id,
			"html": o.text,
			"class": "mui-table-view-cell"
		});
		li.on("tap", function() {
			f_setResult(o);
		});
		$("#content").append(li);
	});
}

function f_setResult(o) {
	var self = plus.webview.currentWebview();
	var opener = self.opener();
	opener.evalJS("f_setDropValue('" + o.id + "','" + o.text + "','" + exdata + "')");
	self.close();
}