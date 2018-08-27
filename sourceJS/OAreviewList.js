$(function() {
	mui.init();
	mui.plusReady(function() {
		defineBgColor();
		tdata=plus.webview.currentWebview().tdata;
		loadData(1, 10);
	});
	mui.back = function() {
		var self = plus.webview.currentWebview();
		var opener = self.opener();
		if(opener != null) {
			opener.evalJS("f_loadOAList()");
		}
		self.close();
	};
});
var tdata=null;
function loadData(page, pagesize) {
	//flist
	$.post(Service_url + "efwebservice_oa.asmx/Get_OA_Info_WaitReview_List", {
		"companyid": plus.storage.getItem("companyID"),
		"gzrybm": plus.storage.getItem("ID"),
		"pagesize": pagesize,
		"pageindex": page,
		"Linces": Linces
	}, function(data) {
		var jdata = eval("(" + data + ")");
		if(page == 1) {
			$(".mui-table-view").empty();
		}
		if(jdata != null && jdata.Table.length > 0) {
			$.each(jdata.Table, function(i, o) {
				$(".mui-table-view").append(f_showData(o));
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
				$(".mui-table-view").append(more);
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
	var temp_data=null;
	if(tdata!=null)
	{
		$.each(tdata, function(xi,xo) {
			if(xo.templetid==o.templetid)
			{
				temp_data=xo;
			}
		});
	}
	 
	a.append(i);
	li.on("tap", function() {
		mui.openWindow({
			url: "OAreview.html",
			id: "OAreview" + o.info_id,
			extras: {
				data: o,
				tdata:temp_data
			},
			waiting: {
				autoShow: true
			}
		});
	});
	return li.append(a);
}