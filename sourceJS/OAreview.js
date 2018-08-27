$(function() {
	mui.init();
	mui.plusReady(function() {
		defineBgColor(); 
		var exdata = plus.webview.currentWebview().data;
		var tdata = plus.webview.currentWebview().tdata;

		loadData(exdata, tdata);
		$("#btn_Save").on("tap", function() {
			f_save(exdata,tdata);
		});
		GetLoctions(null, $("#OAlng"), $("#OAlat"));
		newPlaceholder();
	});
	mui.back = function() {
		var self = plus.webview.currentWebview();
		var opener = self.opener();
		if(opener != null) {
			opener.evalJS("loadData(1,10)");
		}
		self.close();
	};
});

function loadData(exdata, tdata) {
	if(exdata != null) {
		$("#OAid").val(exdata.info_id);
		$("#title").html("审核(" + exdata.info_id + ")");
		$.post(Service_url + "efwebservice_oa.asmx/Get_OA_Info_List", {
			"companyid": plus.storage.getItem("companyID"),
			"tablename": exdata.templetid,
			"gzrybm": "",
			"status": "",
			"id": exdata.info_id,
			"pagesize": 10,
			"pageindex": 1,
			"Linces": Linces
		}, function(data) {
			var jdata = eval("(" + data + ")");
			if(jdata != null && jdata.Table.length > 0) {

				f_createForm(tdata, jdata.Table[0]);

				f_showData2(jdata.Table[0], exdata);
			}
		});
	}
}

function f_showData2(o, exdata) {
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
	}
	var div = $("<div>", {
		"class": strSh
	});
	var h5 = $("<h5/>", {
		"html": "提交人员：" + o.info_gzryxm + " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
			dateDiffM(new Date(), transDate(o.info_insert_time), "hours").toFixed(2) + "小时前"
	});
	var h6 = $("<h5/>", {
		"html": "提交地址：" + o.info_formataddress
	});
	var lspace = $("<br/>");
	div.append(h5).append(h6).append(lspace);
	li.append(div);
	$("#info_data").append(li);
	f_get_reviewData(exdata);
}

function f_showData(o, exdata) {
	$.post(Service_url + "efwebservice_oa.asmx/Server_Templet_FindById_Company_Templet", {
		"companyid": plus.storage.getItem("companyID"),
		"templetid": exdata.templetid,
		"Linces": Linces
	}, function(data) {
		var jdata = eval("(" + data + ")");
		var templet_columndata = eval("(" + jdata.templet_parameterdata + ")");
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
		}
		var div = $("<div>", {
			"class": strSh
		});
		var div2 = $("<div>");
		var h4 = $("<h4>");
		for(var k in o) {
			$.each(templet_columndata, function(ii, oo) {
				if(oo.cid == k && oo.TYP == "details") {
					if(o[k].indexOf(oo.cid) != -1) {
						f_showDetails(o[k], oo, oo.LBL);
					}
				} else if(oo.cid == k) {
					var p = $("<p>", {
						"html": oo.LBL.trim() + "：" + o[k],
						"class": "oa_content"
					});
					h4.append(p);
				}
			});
		}
		var h5 = $("<h5/>", {
			"html": "提交人员：" + o.info_gzryxm + " &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
				dateDiffM(new Date(), transDate(o.info_insert_time), "hours").toFixed(2) + "小时前"
		});
		div2.append(h4).append(h5);
		div.append(div2);
		li.append(div);
		$("#info_data").append(li);
		f_get_reviewData(exdata);
	});
}

function f_showDetails(o, f, kw) {
	var $li = $("<li/>", {
		"class": "mui-table-view-cell"
	});
	var $div2 = $("<div>");
	var $title = $("<h5>", {
		"html": kw
	});

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
	$("#details-data").append($li);
}

function f_save(exdata,tdata) {
	f_saveModi(tdata, function(res) {
		if(!res) return;
		$.post(Service_url + "efwebservice_oa.asmx/Accept_OA_Review", {
			"companyid": plus.storage.getItem("companyID"),
			"tablename": exdata.templetid,
			"info_id": exdata.info_id,
			"review_id": exdata.review_id,
			"id": exdata.id,
			"gzry": plus.storage.getItem("ID"),
			"memo": $("#reviewBz").val(),
			"shjg": $("#reviewRes").val(),
			"lat": $("#OAlat").val(),
			"lng": $("#OAlng").val(),
			"Linces": Linces
		}, function(data) {
			if(files.length > 0) {
				var info = f_getPhotoInfo(exdata.info_id, exdata);
				uploadOA(files, info);
			}
			var jdata = eval("(" + data + ")");
			plus.nativeUI.alert(jdata, null, "提示信息");
			var self = plus.webview.currentWebview();
			self.opener().evalJS("loadData(1,10)");
			self.close();
		});
	});
}

// 定义附件上传
var self, data;

var imageList = document.getElementById('image-list');
var imageIndexIdNum = 0;
var size = null;
var files = [];
var index = 1;
var fileInput;
var emptyInput;
var empptyholder;
var compressImageIndex = 0;
var maximum = 8,
	oldMax = 8;

function getFileInputArray() {
	return [].slice.call(imageList.querySelectorAll('.file'));
}

function newPlaceholder() {
	var fileInputArray = getFileInputArray();
	if(fileInputArray && fileInputArray.length > 0 &&
		fileInputArray[fileInputArray.length - 1].parentNode.classList.contains('space')) {
		return;
	}
	addEmptyPlace();
}

function addEmptyPlace() {
	if(empptyholder != null) {
		imageList.removeChild(empptyholder);
	}
	empptyholder = document.createElement('div');
	empptyholder.setAttribute('class', 'image-item space');
	emptyInput = document.createElement('div');
	emptyInput.setAttribute('class', 'file');
	emptyInput.setAttribute('id', 'image-emp');

	emptyInput.addEventListener("tap",
		function() { //对添加图片的按钮的监听

			maximum = oldMax - files.length;
			if(maximum <= 0) {
				plus.nativeUI.toast("已经是最大上传数量，不能选择!");
				return;
			}
			var self = emptyInput;
			plus.nativeUI.confirm(
				" ",
				function(ex) { //弹框的选择监听
					if(ex.index == 1) { //选择文件导入
						plus.gallery.pick(
							function(e) { //选择文件
								//处理获取到的图片
								compressImageIndex = 0;
								dealImagePath(e, self);
							},
							function(e) {
								plus.nativeUI.toast(e.Message);
							}, {
								maximum: maximum,
								multiple: true,
								filter: "image",
								system: false
							}
						)
					} else if(ex.index == 2) {
						var cmr = plus.camera.getCamera();
						cmr.captureImage(function(ie) {
							var name = ie.substr(ie.lastIndexOf('/') + 1);
							plus.zip.compressImage({
								src: ie,
								dst: '_doc/' + name,
								overwrite: true,
								quality: 50
							}, function(zip) {
								size += zip.size;
								if(size > 10 * 1000 * 1000) {
									return mui.toast('图片文件压缩后已超过10M上限');
								} else {
									//addFile(zip.target);
									addPlaceholder(zip.target);
									addEmptyPlace();
								}
							}, function(zipe) {
								plus.nativeUI.toast('压缩失败');
							});
						}, function(iee) {});
					}
				},
				" ", ["取消", "相册", "拍照"])
		}, false
	);
	empptyholder.appendChild(emptyInput);
	imageList.appendChild(empptyholder);
}

function dealImagePath(e, self) {
	showWaitting("图片压缩中...");
	var len = e.files.length;
	var name = Date.parse(new Date());//e.files[compressImageIndex].substr(e.files[compressImageIndex].lastIndexOf('/') + 1);
	plus.zip.compressImage({
			src: e.files[compressImageIndex],
			dst: '_doc/' + name+compressImageIndex+'.jpg',
			overwrite: true,
			formate:'jpg',
			quality: 50
		},
		function(zip) {
			size += zip.size;
			if(size > 10 * 1000 * 1000) {
				return plus.nativeUI.toast('图片文件压缩后已超过10M上限');
			} else {
				if(!self.parentNode.classList.contains('space')) { //已有图片
					files.splice(index - 1, 1, {
						name: "images" + index,
						path: e.files[compressImageIndex]
					});
				} else {
					addPlaceholder(zip.target);
				}
			}
			compressImageIndex++;
			if(compressImageIndex < len) {
				dealImagePath(e, self);
			} else {
				plus.nativeUI.closeWaiting();
				addEmptyPlace();
			}
		},
		function(zip) {
			plus.nativeUI.toast('压缩失败');
		});

}

function addFile(path) {
	var fe = document.getElementById("files");
	fe.innerHTML = "";
	var li = document.createElement("li");
	var n = path.substr(path.lastIndexOf('/') + 1);
	li.innerText = n;
	fe.appendChild(li);

	files.push({
		name: "images" + index,
		path: path
	});
	index++;
}

function addPlaceholder(f) {
	imageIndexIdNum++;
	var placeholder = document.createElement('div');
	placeholder.setAttribute('class', 'image-item space');
	placeholder.setAttribute("id", 'place-' + imageIndexIdNum);

	//删除图片图标
	var closeButton = document.createElement('div');
	closeButton.setAttribute('class', 'image-close');
	closeButton.innerHTML = 'X';

	//小X点击事件
	closeButton.addEventListener('tap', function(event) {
		imageList.removeChild(placeholder);
		$.each(files, function(i, o) {
			files.splice($.inArray(f), 1);
			var a = [];
			a.push(o);
			removeFile(a);
			return false;
		});
	}, false);

	if(placeholder.classList.contains('space')) {
		placeholder.classList.remove("space")
	}
	placeholder.appendChild(closeButton);
	placeholder.style.backgroundImage = 'url(' + f + ')';
	imageList.appendChild(placeholder);
	addFile(f);
}
/*自定义图片上传 end */

function f_getPhotoInfo(id, exdata) {
	var pinfo = {
		"attch_type": exdata.templetname,
		"attch_gzry": plus.storage.getItem("ID"),
		"attch_gzryxm": plus.storage.getItem("name"),
		"companyid": plus.storage.getItem("companyID"),
		"templetid": exdata.templetid,
		"info_id": id,
		"review_id_main": exdata.id,
		"review_id": exdata.review_id,
		"attch_name": "",
		"attch_lat": $("#OAlat").val(),
		"attch_lng": $("#OAlng").val()
	};
	return pinfo;
}

function f_get_reviewData(exdata) {
	$.post(Service_url + "efwebservice_oa.asmx/Get_OA_Info_Review", {
		"companyid": plus.storage.getItem("companyID"),
		"tablename": exdata.templetid,
		"info_id": exdata.info_id,
		"review_id": "",
		"gzry": "",
		"shjg": "",
		"Linces": Linces
	}, function(data) {
		var jdata = eval("(" + data + ")");
		if(jdata != null && jdata.Table.length > 0) {
			$("#review-space").attr("style", "display:block;");
			$("#review_data").empty();
			$.each(jdata.Table, function(i, o) {
				$("#review_data").append(f_showReviewData(o, exdata));
			});
		}
	});
}

//查询审核信息
function f_showReviewData(o, exdata) {
	if(o.review_status != "0") {
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

		var shdiff = o.review_time == "" ? "" : "耗时" + dateDiffM(new Date(o.review_time), new Date(o.djrq), "hours").toFixed(2) + "小时";
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
}