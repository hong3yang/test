$(function() {
	mui.init();
	mui.plusReady(function() {
		defineBgColor();
		f_loadOAList();
		$("#btnIm").bind("tap", function() {
			if(vilLolgin()) {
				plus.channelId.gotoIM(plus.storage.getItem("ID"),
					Service_url + plus.storage.getItem("photo"),
					plus.storage.getItem("name"),
					plus.storage.getItem("token"),
					plus.storage.getItem("defineBgColor"));
			}
		});
	});
});

function f_loadOAList() {
	if(plus.storage.getItem("companyID") == null || plus.storage.getItem("companyID") == "") {
		$("#vlist").empty();
		return;
	}
	
	$.post(Service_url + "efwebservice_oa.asmx/Server_Templet_FindById_Company", {
		"companyid": plus.storage.getItem("companyID"),
		"Linces": Linces
	}, function(data) {
		var jdata = eval("(" + data + ")");
		$("#vlist").empty();
		if(jdata != null && jdata.length > 0) {
			f_loadDbsw(jdata);
			$.each(jdata, function(i, o) {
				$("#vlist").append(f_showData(o));
			});
		}
		f_refushCount();
	});
}

function f_showData(o) {
	var li = $("<li>", {
		"class": "mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-4"
	});
	var formData = eval("(" + o.templet_formdata + ")");
	var colors = formData.IMG == "" ? "&#xe720;@color:#000000;" : formData.IMG;
	var i = $("<span/>", {
		"class": "mui-icon icon Hui-iconfont",
		"html": colors.split("@")[0],
		"style": colors.split("@")[1]
	});
	var div = $("<div>", {
		"class": "mui-media-body",
		"html": o.templetname
	});
	var ttp = $("<span/>", {
		"class": 'mui-badge',
		"html": "",
		"style": "padding:0px 5px;"
	});
	i.append(ttp);
	li.append(i).append(div);
	li.on("tap", function() {
		mui.openWindow({
			url: "OALists.html",
			id: "OALists" + o.templetid,
			extras: {
				data: o
			},
			waiting: {
				autoShow: true
			}
		});
	});
	return li;
}

function f_loadDbsw(templete_data) {
	var li = $("<li>", {
		"class": "mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-4",
		"id": "lidbsw"
	});
	var i = $("<span/>", {
		"class": "mui-icon icon Hui-iconfont red",
		"html": "&#xe606;"
	});
	var div = $("<div>", {
		"class": "mui-media-body",
		"html": "待办事务"
	});
	var ttp = $("<span/>", {
		"class": 'mui-badge',
		"html": ""
	});
	i.append(ttp);
	li.append(i).append(div);
	li.on("tap", function() {
		mui.openWindow({
			url: "OAreviewList.html",
			id: "OAreviewList",
			waiting: {
				autoShow: true
			},
			extras: {
				tdata: templete_data
			}
		});
	});
	$("#vlist").append(li);
	
	var li = $("<li>", {
		"class": "mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-4",
		"id": "liybsw"
	});
	var i = $("<span/>", {
		"class": "mui-icon icon Hui-iconfont blue",
		"html": "&#xe6e1;"
	});
	var div = $("<div>", {
		"class": "mui-media-body",
		"html": "已办事务"
	});
 
	li.append(i).append(div);
	li.on("tap", function() {
		mui.openWindow({
			url: "OAviewList.html",
			id: "OAviewList",
			waiting: {
				autoShow: true
			}
		});
	});
	$("#vlist").append(li);
}

function f_refushCount() {
	$.post(Service_url + "efwebservice_oa.asmx/Get_OA_Info_WaitReview_Count", {
		"companyid": plus.storage.getItem("companyID"),
		"gzrybm": plus.storage.getItem("ID"),
		"Linces": Linces
	}, function(data) {
		$("#lidbsw .mui-badge").html(eval("(" + data + ")"));
	});
}