mui.init({
	gestureConfig: {
		longtap: true //默认为false
	}
});
mui.plusReady(function() {
	defineBgColor();
	var self = plus.webview.currentWebview();
	var exdata = self.data;
	f_getWait_info(exdata, "item0", 1, 10);
	$("#new").on("tap", function() {
		mui.openWindow({
			url: "OAhform.html",
			id: "OAhform" + exdata.templetid,
			extras: {
				data: {
					"odata": null,
					"exdata": exdata
				}
			},
			waiting: {
				autoShow: true
			}
		});
	});
	$("#segmentedControl").on("tap", "a", function() {
		f_getWait_info(exdata, this.href.split("#")[1], 1, 10);
	});
	plus.nativeUI.toast("长按未审核单据，可以修改重新提交!");
	
	var s = eval("("+exdata.templet_formdata+")");
	document.getElementById("title").innerHTML=s.FRMNM;
}); 

function f_getWait_info(exdata, it, page, pagesize) {
	if(typeof exdata != "object") {
		exdata = eval("(" + exdata + ")");
	}
	$.post(Service_url + "efwebservice_oa.asmx/Get_OA_Info_List?jsoncallback=?", {
		"companyid": exdata.companyid,
		"tablename": exdata.templetid,
		"gzrybm": plus.storage.getItem("ID"),
		"status": it == "item3" ? "" : it.replace("item", ""),
		"id": "",
		"pagesize": pagesize,
		"pageindex": page,
		Linces: Linces
	}, function(data) {
		if(page == 1) {
			$("#" + it + " ul").empty();
		}
		if(data != null && data.Table.length > 0) {
			var jdata = data.Table;
			$.each(jdata, function(i, o) {
				$("#" + it + " ul").append(f_showData(o, exdata));
			});
			if(data.Table.length == pagesize) {
				$("#" + it + "_more").remove();
				var more = $("<li/>", {
					"class": "mui-table-view-cell",
					"style":"text-align:center;",
					"id": it + "_more",
					"html": "加载更多"
				});
				more.bind("tap", function() {
					f_getWait_info(exdata, it, page + 1, pagesize);
				});
				$("#" + it + " ul").append(more);
			} else {
				$("#" + it + "_more").remove();
			}
		} else {
			$("#" + it + "_more").remove();
		}
	}, "jsonp");
}

function f_showData(o, exdata) {
	var oData = o;
	var templet_columndata = exdata.templet_columndata.split(",");
	var templet_columnname = exdata.templet_columnname.split(",");
	var li = $("<li/>", {
		"class": "mui-table-view-cell"
	});
	var strSh = "";
	switch(o.status) {
		case "1":
			strSh = "icon-dsh";
			break;
		case "2":
			strSh = "icon-sh";
			break;
		case "0":
			strSh = "icon-wtj";
			break;
	}
	var div = $("<div>", {
		"class": strSh
	});
	var div2 = $("<div>");
	var h4 = $("<h4>");
	for(var k in o) {
		if($.inArray(k, templet_columndata) != -1) {
			var p;
			$.each(eval("(" + exdata.templet_parameterdata + ")"), function(pi, po) {
				if(po.TYP == "details" && po.cid == k) {} else if(po.cid == k) {
					if(typeof(o[k]) == "string") {
						p = $("<p>", {
							"html": templet_columnname[$.inArray(k, templet_columndata)] + "：" + o[k].allReplace("\n", "<br/>"),
							"class": "oa_content"
						});
					} else {
						p = $("<p>", {
							"html": templet_columnname[$.inArray(k, templet_columndata)] + "：" + o[k],
							"class": "oa_content"
						});
					}
				}
			});
			if(typeof(o[k]) == "string") {
				oData[templet_columnname[$.inArray(k, templet_columndata)]] = o[k].allReplace("\n", "<br/>");
			} else {
				oData[templet_columnname[$.inArray(k, templet_columndata)]] = o[k];
			}
			delete oData[k];
			h4.append(p);
		}
	}
	var h5 = $("<h5/>", {
		"html": "操作人员：" + o.info_gzryxm + " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
			dateDiffM(new Date(), transDate(o.info_insert_time), "hours").toFixed(2) + "小时前"
	});
	div2.append(h4).append(h5);
	div.append(div2);
	if(o.status == 0) {
		li.on("tap", function() {
			mui.openWindow({
				url: "OAhform.html",
				id: "OAhform" + exdata.templetid,
				extras: {
					data: {
						"odata": oData,
						"exdata": exdata
					}
				},
				waiting: {
					autoShow: true
				}
			});
		});
	} else {
		li.on("tap", function() {
			mui.openWindow({
				url: "OAdetails.html",
				id: "OAdetails" + exdata.templetid,
				extras: {
					data: {
						"odata": oData,
						"exdata": exdata
					}
				},
				waiting: {
					autoShow: true
				}
			});
		});
	}
	if(o.status == "1") {
		li.on("longtap", function() {
			mui.openWindow({
				url: "OAhform.html",
				id: "OAhform" + exdata.templetid,
				extras: {
					data: {
						"odata": oData,
						"exdata": exdata
					}
				},
				waiting: {
					autoShow: true
				}
			});
		});
	}
	return li.append(div);
}

function f_showDetails(data, pdata, keys) {
	var $div = $("<div>", {
		"class": "div-details-left"
	});
	if(data.indexOf(keys) != -1) {
		var odata = eval("(" + data + ")");
		$.each(odata, function(i, o) {
			for(var k in o) {
				$.each(pdata.ITMS, function(ii, oo) {
					if(k == oo.NAME && oo.ISSHOW == "1") {
						var $p = $("<p>", {
							"html": oo.VAL + ":" + o[k]
						});
						$div.append($p);
					}
				});
			}
		});
	}
	return $div;
}