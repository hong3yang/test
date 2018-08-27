$(function() {
	mui.init();
	mui.plusReady(function() {
		f_init();
	});
});

function f_init() {
	defineBgColor();
	$("#djrq1").bind('tap', function() {
		var optionsJson = this.getAttribute('data-options') || '{}';
		var options = JSON.parse(optionsJson);
		var id = this.getAttribute('id');
		var picker = new mui.DtPicker(options);
		picker.show(function(rs) {
			$("#djrq1").html(rs.text);
			picker.dispose();
		});
	});
	$("#djrq2").bind('tap', function() {
		var optionsJson = this.getAttribute('data-options') || '{}';
		var options = JSON.parse(optionsJson);
		var id = this.getAttribute('id');
		var picker = new mui.DtPicker(options);
		picker.show(function(rs) {
			$("#djrq2").html(rs.text);
			picker.dispose();
		});
	});
	$("#btnSearch").bind("tap", function() {
		loadData(1, 15);
		if($("#searchBar").find("li").length > 0) {
			$($("#searchBar").find("li")[0]).removeClass("mui-active");
		}
	});
	f_loadOAList();
	f_getDemp();
	loadData(1, 15);
}
var tempData = null;

function f_loadOAList() {
	if(plus.storage.getItem("companyID") == null || plus.storage.getItem("companyID") == "") {
		return;
	}
	$.post(Service_url + "efwebservice_oa.asmx/Server_Templet_FindById_Company", {
		"companyid": plus.storage.getItem("companyID"),
		"Linces": Linces
	}, function(data) {
		var jdata = eval("(" + data + ")");
		tempData = jdata;
		if(jdata != null && jdata.length > 0) {
			$("#templetid").empty();
			var optl = $("<option/>", {
				"value": "",
				"html": "全部"
			});
			$("#templetid").append(optl);
			$.each(jdata, function(i, o) {
				var opt = $("<option/>", {
					"value": o.templetid,
					"html": o.templetname
				});
				$("#templetid").append(opt);
			});
		}
	});
}

function f_getDemp() {
	$.post(Service_url + "efwebservice_oa.asmx/Get_BM_OA_DepartMent?jsoncallback=?", {
		"companyid": plus.storage.getItem("companyID"),
		"Linces": Linces
	}, function(data) {
		if(data != null && data.length > 0) {
			$("#review_gzbm").empty();
			var optl = $("<option/>", {
				"value": "",
				"html": "全部"
			});
			$("#review_gzbm").append(optl);
			$.each(data, function(i, o) {
				var opt = $("<option/>", {
					"value": o.gzbm,
					"html": o.gzbm
				});
				$("#review_gzbm").append(opt);
			});
		}
	}, "jsonp");
}

function loadData(page, pagesize) {
	showWaitting();

	$.post(Service_url + "efwebservice_oa.asmx/Get_OA_Info_Review_List", {
		"companyid": plus.storage.getItem("companyID"),
		"gzrybm": plus.storage.getItem("ID"),
		"review_gzryxm": $("#review_gzryxm").val(),
		"review_gzbm": $("#review_gzbm").val(),
		"review_gzzw": "",
		"review_status": $("#review_status").val(),
		"djrq1": $("#djrq1").html() == "选择日期 ..." ? "" : $("#djrq1").html(),
		"djrq2": $("#djrq2").html() == "选择日期 ..." ? "" : $("#djrq2").html(),
		"templetid": $("#templetid").val(),
		"pagesize": pagesize,
		"pageindex": page,
		"Linces": Linces
	}, function(data) {
		plus.nativeUI.closeWaiting();
		if(page == 1) {
			$(".list-content").empty();
		}
		var jdata = eval("(" + data + ")");
		if(jdata != null && jdata.Table.length > 0) {
			$.each(jdata.Table, function(i, o) {
				$(".list-content").append(f_showData(o));
			});
			if(jdata.Table.length == pagesize) {
				$("#page_more").remove();
				var more = $("<li/>", {
					"class": "mui-table-view-cell",
					"style": "text-align:center;",
					"id": "page_more", 
					"html": "加载更多"
				});
				more.bind("tap", function() {
					loadData(page + 1, pagesize);
				});
				$(".list-content").append(more);
			} else {
				$("#page_more").remove();
			}
		} else {
			$("#page_more").remove();
		}
	});
}

function f_showData(o) {
	var li = $("<li/>", {
		"class": "mui-table-view-cell",
		"style": "height:auto;"
	});

	var a = $("<a>", {
		"class": "mui-navigate-right",
		"html": "【" + o.source_gzbm + o.source_gzryxm + "-" + o.templetname + o.djrq + "】" + o.info_memo
	});

	var i = $("<i>", {
		"class": "i-hours",
		"html": dateDiffM(new Date(), transDate(o.djrq), "hours").toFixed(2) + "小时前"
	});
	a.append(i);
	li.on("tap", function() {
		var templet;
		$.each(tempData, function(ti, to) {
			if(to.templetid == o.templetid) {
				templet = to;
			}
		});

		showWaitting();
		$.post(Service_url + "efwebservice_oa.asmx/Get_OA_Info_List?jsoncallback=?", {
			"companyid": plus.storage.getItem("companyID"),
			"tablename": o.templetid,
			"gzrybm": "",
			"status": "",
			"id": o.info_id,
			"pagesize": 10,
			"pageindex": 1,
			Linces: Linces
		}, function(data) {

			plus.nativeUI.closeWaiting();
			if(data != null && data.Table.length > 0) {
				var oData = null;
				oData = data.Table[0];
				for(var k in oData) {
					if($.inArray(k, templet.templet_columndata.split(",")) != -1) {
						oData[templet.templet_columnname.split(",")[$.inArray(k, templet.templet_columndata.split(","))]] = oData[k];
						delete oData[k];
					}
				}
				mui.openWindow({
					url: "OAdetails.html",
					id: "OAdetails" + o.info_id,
					extras: {
						data: {
							"odata": data.Table[0],
							"exdata": templet
						}
					},
					waiting: {
						autoShow: false
					}
				});
			}
		}, "jsonp");
	});
	return li.append(a);
}