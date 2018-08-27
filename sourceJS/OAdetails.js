mui.init();
mui.plusReady(function() {
	defineBgColor();
	var exdata = plus.webview.currentWebview().data;
	//console.log(JSON.stringify(exdata));

	loadData(exdata.odata, exdata.exdata);
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

function loadData(exdata, pdata) {
	
	var li = $("<li/>", {
		"class": "mui-table-view-cell"
	});
	var strSh = "";
	switch(exdata.status) {
		case "1":
			strSh = "icon-dsh";
			break;
		case "2":
			strSh = "icon-sh";
			break;
	}
	var div = $("<div>", {
		"class": strSh
	});
	var div2 = $("<div>");
	var h4 = $("<h4>");
	var content = "";
	var filter = "statusstatus_reviewsource_templetidsource_reviewinfo_gzbminfo_gzzwinfo_gzrybminfo_gzryxminfo_insert_timeinfo_accept_timeinfo_formataddressinfo_latinfo_lng";
	$("#details_data").empty();
	for(var k in exdata) {
		if(filter.indexOf(k) == -1) {
			$.each(eval("(" + pdata.templet_parameterdata + ")"), function(ii, oo) {
				if(k == oo.LBL && oo.TYP == "details") {
					if(exdata[k].indexOf(oo.cid) != -1) {
						f_showDetails(exdata[k], oo, k);
						
						var s =exdata[k];
						
						if(typeof(s) == "string") {
							s = s.allReplace("\n", "");
						}

						$.each(eval("(" + s + ")"), function(index, va) {
							content += va.xmmc + va.memo1;
						})
					}
				} else if(k == oo.LBL) {
					var p;
					if(typeof(exdata[k]) == "string") {
						p = $("<p>", {
							"html": k + "：" + exdata[k].toString().allReplace("\n", "<br/>"),
							"class": "oa_content"
						});
						
						content += k + "：" + exdata[k].toString().allReplace("\n", "");
					} else {
						p = $("<p>", {
							"html": k + "：" + exdata[k],
							"class": "oa_content"
						});
						content += k + "：" + exdata[k];
					}
					h4.append(p);
				}
			});

		}
	}
	
	var h5 = $("<h5/>", {
		"html": "提交人员：" + exdata.info_gzryxm + " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
			dateDiffM(new Date(), transDate(exdata.info_insert_time), "hours").toFixed(2) + "小时前"
	});
	
	var voice = $("<img>",{
		"style":"float:right;width:24px;height:24px",
		"src":"img/voice.svg"
	})
	
	
	var attchBtn = $("<a/>", {
		"html": "查看附件",
		"style": "z-index:100;padding:5px;font-size:14px;"
	});
	
	voice.on("tap",function(e){
		plus.channelId.startRead(content);
	})

	attchBtn.on("tap", function() {
		mui.openWindow({
			url: "OAfiles.html",
			id: "OAfiles" + exdata.templetid,
			extras: {
				data: {
					"exdata": exdata,
					"oData": null
				}
			},
			waiting: {
				autoShow: true
			}
		});

	});
	h5.append(voice);
	var h6 = $("<p/>", {
		"html": "提交地址：" + exdata.info_formataddress,
		"class": "oa_content"
	});
	h4.append(h6);
	h4.append(attchBtn);
	div2.append(h4).append(h5);
	div.append(div2);
	li.append(div);
	$("#info_data").empty();
	$("#info_data").append(li);
	f_get_reviewData(exdata);
}

function f_get_reviewData(exdata) {
	$.post(Service_url + "efwebservice_oa.asmx/Get_OA_Info_Review", {
		"companyid": plus.storage.getItem("companyID"),
		"tablename": exdata.source_templetid,
		"info_id": exdata.id,
		"review_id": "",
		"gzry": "",
		"shjg": "",
		"Linces": Linces
	}, function(data) {
		var jdata = eval("(" + data + ")");
		if(jdata != null && jdata.Table.length > 0) {
			$("#review_data").empty();
			$.each(jdata.Table, function(i, o) {
				if(o.review_memo != "仅查询") {
					$("#review_data").append(f_showReviewData(o, exdata));
				}
			});
		}
	});
}

function f_showReviewData(o, exdata) {
	var status = "",
		strCss = "";
	switch(o.review_status) {
		case "0":
			status = "待审核";
			strCss = "red";
			break;
		case "1":
			status = "同意";
			strCss = "blue";
			break;
		case "2":
			status = "拒绝";
			strCss = "cay";
			break;
		case "3":
			status = "弃审";
			strCss = "orange";
			break;
	}
	var div = $("<div>");
	var div2 = $("<div>");
	var h4 = $("<h4>");
	var p1 = $("<p>", {
		"html": "审核流程：" + o.review_name,
		"class": "oa_content " + strCss
	});
	var p2 = $("<p>", {
		"html": "审核备注：" + o.review_memo,
		"class": "oa_content " + strCss
	});

	var li = $("<li/>", {
		"class": "mui-table-view-cell "
	});

	var p3 = $("<p>", {
		"html": "审核结果：" + status,
		"class": "oa_content " + strCss
	});
	h4.append(p1).append(p2).append(p3);

	var shdiff = o.review_time == "" ? "" : "耗时" + dateDiffM(transDate(o.review_time), transDate(o.djrq), "hours").toFixed(2) + "小时";
	var h5 = $("<h5/>", {
		"html": "审核人员：" + o.review_gzryxm + " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + shdiff
	});
	if(shdiff != "") {
		var attchBtn = $("<a/>", {
			"html": "查看附件",
			"style": "margin-left:20px;z-index:100;padding:5px;"
		});
		h5.append(attchBtn);
		attchBtn.on("tap", function() {
			mui.openWindow({
				url: "OAfiles.html",
				id: "OAfiles" + exdata.templetid,
				extras: {
					data: {
						"exdata": exdata,
						"oData": o
					}
				},
				waiting: {
					autoShow: true
				}
			});
		});
	}
	div2.append(h4).append(h5);
	div.append(div2);
	return li.append(div);
}

function f_showDetails(o, f, kw) {

	var $li = $("<li/>", {
		"class": "mui-table-view-cell"
	});
	var $div2 = $("<div>");
	var $title = $("<h5>", {
		"html": kw
	});
	if(typeof(o) == "string") {
		o = o.allReplace("\n", "<br/>");
	}
	var $obj = eval("(" + o + ")");
	if($obj != undefined && $obj.length > 0) {
		$.each($obj, function(ii, oo) {

			var $h4 = $("<h4>", {
				"class": "div-detials"
			});

			for(var k in oo) {
				$.each(f.ITMS, function(fi, fo) {

					if(fo.NAME == k && fo.ISSHOW == "1") {
						var $p = $("<p>", {
							"html": fo.VAL + ":" + oo[k]
						});
						$h4.append($p);
					}
				});
			}
			$div2.append($h4);
		});
	}

	$li.append($title).append($div2);
	$("#details_data").append($li);
}