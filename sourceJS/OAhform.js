/*
 * IOS 将 f_createText() 方法中的type 该为text
 */
$(function() {
	mui.init({
		gestureConfig: {
			longtap: true, //默认为false
		}
	});
	mui.plusReady(function() {
		defineBgColor();
		var self = plus.webview.currentWebview();
		var data = self.data;

		f_createForm(data.exdata, data.odata);

		$("#submit").on("tap", function() {
			f_submitData(data.exdata, "A");
		});
		$("#save").on("tap", function() {
			f_submitData(data.exdata, "S");
		});
		if(data.odata != null) {
			f_setData(data.odata, data.exdata);
		}
		newPlaceholder();
		GetLoctions($("#OAaddress"), $("#OAlng"), $("#OAlat"));
		mui.back = function() {
			plus.nativeUI.confirm("是否保存已编辑信息？", function(e) {
				if(e.index == 0) {
					f_submitData(data.exdata, "S");
				} else {
					var self = plus.webview.currentWebview();
					var opener = self.opener();
					opener.evalJS("f_getWait_info(" + JSON.stringify(data.exdata) + ", 'item0',1,10)");
					self.close();
				}
			}, "提示信息", ["是", "否"]);
		}
		f_resetShow();
	});
});

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
	var name = Date.parse(new Date());
	plus.zip.compressImage({
			src: e.files[compressImageIndex],
			dst: '_doc/' + name+compressImageIndex+".jpg",
			overwrite: true,
			format:"jpg",
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

function f_createForm(exdata, odata) {
	var hasDetails = false;
	$("#title").html(exdata.templetname);
	var templet_columntype = exdata.templet_columntype.split(",");
	var templet_formdata = eval("(" + exdata.templet_formdata + ")");
	var templet_parameterdata = eval("(" + exdata.templet_parameterdata + ")");
	$(".mui-input-group").empty();
	$.each(templet_columntype, function(i, o) {
		switch(o) {
			case "dropdown":
				$("#form_group").append(f_createDropdown(templet_parameterdata[i]));
				break;
			case "textarea":
				$("#form_group").append(f_createTextarea(templet_parameterdata[i]));
				break;
			case "text":
				$("#form_group").append(f_createText(templet_parameterdata[i]));
				break;
			case "date":
				$("#form_group").append(f_createDate(templet_parameterdata[i]));
				break;
			case "number":
				$("#form_group").append(f_createText(templet_parameterdata[i]));
				break;
			case "radio":
				$("#form_group").append(f_createRadio(templet_parameterdata[i]));
				break;
			case "checkbox":
				$("#form_group").append(f_createCheckbox(templet_parameterdata[i]));
				break;
			case "details":
				var btnAdd = $("<button>", {
					"html": "增加",
					"class": "mui-btn mui-btn-danger mui-btn-outlined",
					"style": "width:100%;background-color:#FFF;margin-top:5px;",
					"id": "btn_" + templet_parameterdata[i].cid
				});

				$("#details_group").append(f_createDetails(templet_parameterdata[i]));
				$("#details_group").append(btnAdd);
				btnAdd.bind("tap", function() {
					di++;
					var div = f_createDetails(templet_parameterdata[i]);
					div.insertBefore($(this));
				});
				hasDetails = true;
				break;
		}
	});
}

function f_createDropdown(pdata) {
	var div = $("<div/>", {
		"class": "mui-input-row"
	});
	var lab = $("<label/>", {
		"html": pdata.LBL + "："
	});
	var sel = $("<select/>", {
		"id": pdata.cid 
	});
	if(pdata.PURL.indexOf("http") != -1) {
		sel=$("<input />",{
			"class":"mui-input-clear",
			"type":"text",
			"id":pdata.cid,
			"disabled":true
		});
		var uri = pdata.PURL;
		var span=$("<span/>",{
			"class":"mui-icon mui-icon-arrowdown mui-select-icon"
		});
		div.append(span);
		span.on("tap", function() {
			mui.openWindow({
				url: "OAdropdownPage.html",
				id: "OAdropdownPage" + pdata.cid,
				extras: {
					data: pdata.cid,
					uri: uri
				},
				waiting: {
					autoShow: true
				}
			});
		});
	} else {
		$.each(pdata.ITMS, function(i, o) {
			var opts = $("<option/>", {
				"value": o.VAL,
				"html": o.VAL,
				"checked": o.CHKED == 0 ? false : true
			});
			sel.append(opts);
		});
	}
	div.append(lab).append(sel);
	return div;
}

function f_createCheckbox(pdata) {
	var div = $("<div/>", {
		"class": "mui-input-row",
		"height": "auto"
	});
	var lab = $("<label/>", {
		"html": pdata.LBL + "："
	});
	var rdiv = $("<div/>", {
		"class": "radio-div"
	});

	$.each(pdata.ITMS, function(i, o) {
		var ritem = $("<div/>", {
			"class": "radio-item"
		});
		var rlab = $("<label/>", {
			"class": "radio-item-lab",
			"html": o.VAL
		});
		var rd = $("<input/>", {
			"class": "radio-item-ipt",
			"type": "checkbox",
			"value": o.VAL,
			"name": pdata.cid,
			"data-must": pdata.REQD == "1" ? true : false
		});
		ritem.append(rd).append(rlab);
		rdiv.append(ritem);
	});
	div.append(lab).append(rdiv);
	return div;
}

function f_createRadio(pdata) {
	var div = $("<div/>", {
		"class": "mui-input-row",
		"height": "auto"
	});
	var lab = $("<label/>", {
		"html": pdata.LBL + "："
	});
	var rdiv = $("<div/>");
	$.each(pdata.ITMS, function(i, o) {
		var ritem = $("<div/>", {
			"class": "radio-item"
		});
		var rlab = $("<label/>", {
			"class": "radio-item-lab",
			"html": o.VAL
		});
		var rd = $("<input/>", {
			"class": "radio-item-ipt",
			"type": "radio",
			"value": o.VAL,
			"name": pdata.cid,
			"data-must": pdata.REQD == "1" ? true : false
		});
		ritem.append(rd).append(rlab);
		rdiv.append(ritem);
	});
	div.append(lab).append(rdiv);
	return div;
}

function f_createTextarea(pdata) {
	var lab = $("<label/>", {
		"html": pdata.LBL + "："
	});
	var div = $("<div/>", {
		"class": "mui-input-row",
		"style": "height:100px"
	});
	var txta = $("<textarea/>", {
		"id": pdata.cid,
		"placeholder": "请输入" + pdata.LBL,
		"row": "5",
		"data-must": pdata.REQD == "1" ? true : false
	});

	div.append(lab).append(txta);
	return div;
}

function f_createText(pdata) {
	var div = $("<div/>", {
		"class": "mui-input-row"
	});
	var lab = $("<label/>", {
		"html": pdata.LBL + "：",
		"class": pdata.REQD == "1" ? "red" : "black"
	});
	var ipt = $("<input/>", {
		"id": pdata.cid,
		"placeholder": "请输入" + pdata.LBL,
		"data-must": pdata.REQD == "1" ? true : false,
		"type": pdata.TYP
	});
	if(pdata.TYP == "number") {
		ipt.bind("change", function() {
			if(f_validateNumber($(this).val())) {

			} else {
				plus.nativeUI.toast("请输入数字型");
				$(this).val("0");
			}
		});
	}
	div.append(lab).append(ipt);
	return div;
}

function f_createDate(pdata) {
	var div = $("<div/>", {
		"class": "mui-input-row"
	});
	var lab = $("<label/>", {
		"html": pdata.LBL + "：",
		"class": pdata.REQD == "1" ? "red" : "black"
	});
	var btn = $("<button/>", {
		"id": pdata.cid,
		"class": "mui-btn-date",
		"data-options": '',
		"data-must": pdata.REQD == "1" ? true : false,
		"html": "选择日期 ..."
	});

	btn.bind('tap', function() {
		var optionsJson = this.getAttribute('data-options') || '{}';
		var options = JSON.parse(optionsJson);
		var id = this.getAttribute('id');
		var picker = new mui.DtPicker(options);
		picker.show(function(rs) {
			btn.html(rs.text);
			picker.dispose();
		});
	});
	div.append(lab).append(btn);
	return div;
}
var di = 1;

function f_createDetails(pdata, ddata) {

	var card_div = $("<div>", {
		"class": "mui-card",
		"style": "margin-top:8px;",
		"name": pdata.cid
	});
	var header_div = $("<div>", {
		"class": "mui-card-header",
		"html": pdata.LBL
	});
	var content_div = $("<div>", {
		"class": "mui-card-content"
	});
	var inner_div = $("<div>", {
		"class": "mui-card-content-inner"
	});
	if(pdata.ITMS != null && pdata.ITMS.length > 0) {
		$.each(pdata.ITMS, function(i, o) {
			if(o.ISSHOW == "1") {
				if(o.TYP == "text" || o.TYP == "number") {
					inner_div.append(f_details_createText(o, di, ddata));
				} else if(o.TYP == "dropdown") {
					inner_div.append(f_details_createDropDown(o, di, ddata));
				} else {
					inner_div.append(f_details_createTextarea(o, di, ddata));
				}
			}
		});
	}
	var delBtn = $("<button>", {
		"html": "删除"
	});
	delBtn.bind("tap", function() {
		card_div.remove();
	});
	header_div.append(delBtn);
	content_div.append(inner_div);
	card_div.append(header_div).append(content_div);
	return card_div;
}

function f_submitData(exdata, stype) {

	var columnData = eval("(" + exdata.templet_parameterdata + ")");
	var gdata = {},
		gv = "",
		details_data;

	$.each(columnData, function(i, o) {

		switch(o.TYP) {
			case "text":
				gdata[o.cid] = $("#" + o.cid).val();
				if($("#" + o.cid).attr("data-must") == "true" && $("#" + o.cid).val() == "") {
					gv += o.LBL + ",";
				}
				break;
			case "number":
				gdata[o.cid] = $("#" + o.cid).val();
				if($("#" + o.cid).attr("data-must") == "true" && $("#" + o.cid).val() == "") {
					gv += o.LBL + ",";
				}
				break;
			case "textarea":
				gdata[o.cid] = $("#" + o.cid).val();
				if($("#" + o.cid).attr("data-must") == "true" && $("#" + o.cid).val() == "") {
					gv += o.LBL + ",";
				}
				break;
			case "dropdown":
				gdata[o.cid] = $("#" + o.cid).val();
				if($("#" + o.cid).attr("data-must") == "true" && $("#" + o.cid).val() == "") {
					gv += o.LBL + ",";
				}
				break;
			case "date":
				gdata[o.cid] = $("#" + o.cid).html() == "选择日期 ..." ? "" : $("#" + o.cid).html();
				if($("#" + o.cid).attr("data-must") == "true" && ($("#" + o.cid).html() == "" || $("#" + o.cid).html() == "选择日期 ...")) {
					gv += o.LBL + ",";
				}
				break;
			case "radio":
				var rv = $('input:radio[name="' + o.cid + '"]:checked').val();
				gdata[o.cid] = rv;
				if($($('input:radio[name="' + o.cid + '"]')[0]).attr("data-must") == "true" && (rv == null || rv == "")) {
					gv += o.LBL + ",";
				}
				break;
			case "checkbox":
				var rv = $('input:checkbox[name="' + o.cid + '"]:checked').val();
				gdata[o.cid] = rv;
				if($($('input:checkbox[name="' + o.cid + '"]')[0]).attr("data-must") == "true" && (rv == null || rv == "")) {
					gv += o.LBL + ",";
				}
				break;
			case "details":
				details_data = f_getDetails_Data(o);
				break;
		}
	});
	//console.log(gv);
	//console.log(JSON.stringify(gdata));
	//return;
	if(details_data != null && details_data.length == 0) {
		plus.nativeUI.alert("请填写明细信息后再提交。", null, "提示信息");
		return;
	}
	if(gv != "" && stype == "A") {
		plus.nativeUI.alert(gv + "为必填请填写完整!", null, "提示信息");
	} else {
		var fdata = eval("(" + exdata.templet_formdata + ")");
		showWaitting("提交中...");
		var oid = $("#OAid").val();
		if(oid == "" || oid == null) {
			$.post(Service_url + 'efwebservice_oa.asmx/Insert_OA_Info', {
				companyid: exdata.companyid,
				tablename: exdata.templetid,
				objvalue: JSON.stringify(gdata),
				operatetype: stype,
				gzbm: "",
				gzzw: "",
				gzrybm: plus.storage.getItem("ID"),
				gzryxm: plus.storage.getItem("name"),
				lat: $("#OAlat").val(),
				lng: $("#OAlng").val(),
				objvalue_sub: details_data == null ? "" : JSON.stringify(details_data),
				Linces: Linces
			}, function(o) {
				plus.nativeUI.closeWaiting();
				var rst = eval("(" + o + ")");
				if(rst.indexOf("错误") == -1) {

					if(files.length > 0) {
						var info = f_getPhotoInfo(rst, exdata);
						uploadOA(files, info);
					}

					var self = plus.webview.currentWebview();
					var opener = self.opener();
					if(opener != null) {
						opener.evalJS("f_getWait_info(" + JSON.stringify(exdata) + ", 'item0',1,10)");
					}
					plus.nativeUI.alert("提交成功", function(){
						self.close();
					}, "提示信息");
					
				} else {
					plus.nativeUI.alert(rst, null, "提示信息");
				}
			});
		} else {
			$.post(Service_url + 'efwebservice_oa.asmx/Update_OA_Info', {
				companyid: exdata.companyid,
				tablename: exdata.templetid,
				id: oid,
				objvalue: JSON.stringify(gdata),
				operatetype: stype,
				lat: $("#OAlat").val(),
				lng: $("#OAlng").val(),
				objvalue_sub: details_data == null ? "" : JSON.stringify(details_data),
				Linces: Linces
			}, function(o) {
				plus.nativeUI.closeWaiting();
				var rst = eval("(" + o + ")");
				if(rst.indexOf("错误") == -1) {
					if(files.length > 0) {
						var info = f_getPhotoInfo(oid, exdata);
						uploadOA(files, info);
					}
					
					var self = plus.webview.currentWebview();
					var opener = self.opener();
					opener.evalJS("f_getWait_info(" + JSON.stringify(exdata) + ", 'item0',1,10)");
					plus.nativeUI.alert("提交成功", function(){
						self.close();
					}, "提示信息");
					
				} else {
					plus.nativeUI.alert(rst, null, "提示信息");
				}
			});
		}
	}
}

function f_getDetails_Data(pdata) {
	var ddata = []
	var ediv = $("[name='" + pdata.cid + "']");

	if(ediv.length > 0) {
		$.each(ediv, function(i, o) {

			var idata = {
				colname: pdata.cid
			};
			var ipts = $(o).find("input");
			var txts = $(o).find("textarea");
			var sel = $(o).find("select");
			$.each(ipts, function(ii, oo) {
				var keys = $(oo).attr("id").split("_")[0];
				idata[keys] = $(oo).val();
			});
			$.each(txts, function(ii, oo) {
				var keys = $(oo).attr("id").split("_")[0];
				idata[keys] = $(oo).val();
			});
			$.each(sel, function(ii, oo) {
				var keys = $(oo).attr("id").split("_")[0];
				idata[keys] = $(oo).val();
			});
			ddata.push(idata);
		});
	}
	return ddata;
}

function f_setData(o, exdata) {
	var templet_parameterdata = eval("(" + exdata.templet_parameterdata + ")");
	$.each(templet_parameterdata, function(i, xo) {
		$.each(o, function(k) {

			if(k == xo.LBL) {
				if($("#" + xo.cid).val() != undefined) {
					if(typeof(o[k]) == "string") {
						$("#" + xo.cid).val(o[k].allReplace("<br/>", "\n"));
					} else {
						$("#" + xo.cid).val(o[k]);
					}
				} else {
					if(typeof(o[k]) == "string") {
						$("#" + xo.cid).html(o[k].allReplace("<br/>", "\n"));
					} else {
						$("#" + xo.cid).html(o[k]);
					}
				}
				if(xo.TYP == "date") {
					if(typeof(o[k]) == "string") {
						$("#" + xo.cid).html(o[k].allReplace("<br/>", "\n"));
					} else {
						$("#" + xo.cid).html(o[k]);
					}
				}
				if(xo.TYP == "radio") {
					$("input:radio[name='" + xo.cid + "'][value='" + o[k] + "']").attr("checked", true);
				}
				if(xo.TYP == "checkbox") {
					$("input:checkbox[name='" + xo.cid + "'][value='" + o[k] + "']").attr("checked", true);
				}
				if(xo.TYP == "details") {
					if(o[k].indexOf(xo.cid) != -1) {
						if(typeof(o[k]) == "string") {
							o[k] = o[k].allReplace("\n", "<br/>");
						}
						var ddata = eval("(" + o[k] + ")");
						$.each(ddata, function(ii, oo) {
							f_show_DetailsData(ii, oo, xo);
						});
					}
				}
			}
			$("#OAid").val(o.id);
		});
	});
	f_showOldImg(o.id, exdata);
}

function f_showOldImg(id, exdata) {
	$.post(Service_url + "efwebservice_oa.asmx/Get_OA_AttchMent", {
		"companyid": plus.storage.getItem("companyID"),
		"templetid": exdata.templetid,
		"info_id": id,
		"review_id_main": "-1",
		"review_id": "-1",
		"Linces": Linces
	}, function(data) {
		var jdata = eval("(" + data + ")");
		if(jdata != null && jdata.Table.length > 0) {
			oldMax = oldMax - jdata.Table.length;
			$(".files-lists").empty();
			$.each(jdata.Table, function(i, o) {
				var li = $("<li/>");
				var img = $("<img/>", {
					"src": OSS_jyou_url + "/" + o.attch_path,
					"style": "width:100%;height:80px;"
				});
				li.append(img);
				img.on("longtap", function(ex) {
					plus.nativeUI.confirm("是否删除附件?", function(e) {
						if(e.index == 0) {
							f_deleteImg(id, o, exdata, li);
						}
					}, "提示信息");
				});
				$(".files-lists").append(li);
			});
		}
	});
}

function f_deleteImg(id, o, exdata, lobj) {
	$.post(Service_url + "efwebservice_oa.asmx/Delete_OA_AttchMent", {
		"companyid": plus.storage.getItem("companyID"),
		"templetid": exdata.templetid,
		"info_id": id,
		"review_id_main": "-1",
		"review_id": "-1",
		"attch_path": o.attch_path,
		"Linces": Linces
	}, function(data) {
		if(eval("(" + data + ")") == 1) {
			plus.nativeUI.alert("删除成功", null, "提示信息");
			$(lobj).remove();
			oldMax = oldMax + 1;
		}
	});
}

function f_getPhotoInfo(id, exdata) {
	var pinfo = {
		"attch_type": exdata.templetname,
		"attch_gzry": plus.storage.getItem("ID"),
		"attch_gzryxm": plus.storage.getItem("name"),
		"companyid": plus.storage.getItem("companyID"),
		"templetid": exdata.templetid,
		"info_id": id,
		"review_id_main": "-1",
		"review_id": "-1",
		"attch_name": "",
		"attch_lat": $("#OAlat").val(),
		"attch_lng": $("#OAlng").val()
	};
	return pinfo;
}

function f_details_createTextarea(pdata, index, data) {
	var lab = $("<label/>", {
		"html": pdata.VAL + "："
	});
	var div = $("<div/>", {
		"class": "mui-input-row",
		"style": "height:100px"
	});
	var txta = $("<textarea/>", {
		"id": pdata.NAME + "_" + index,
		"placeholder": "请输入" + pdata.VAL,
		"row": "3"
	});
	if(data != null && typeof(data[pdata.NAME]) == "string") {
		$(txta).val(data == null ? "" : data[pdata.NAME].allReplace("<br/>", "\n"));
	} else {
		$(txta).val(data == null ? "" : data[pdata.NAME]);
	}
	div.append(lab).append(txta);
	return div;
}

function f_details_createDropDown(pdata, index, data) {
	var lab = $("<label/>", {
		"html": pdata.VAL + "："
	});
	var div = $("<div/>", {
		"class": "mui-input-row"
	});
	var sel = $("<select/>", {
		"id": pdata.NAME + "_" + index
	});
	if(pdata.IDROP) {
		if(pdata.IDROP.indexOf("http") != -1) {
			sel=$("<input />",{
				"class":"mui-input-clear",
				"type":"text",
				"id": pdata.NAME + "_" + index,
				"disabled":true
			});
			var uri = pdata.IDROP;
			var span=$("<span/>",{
				"class":"mui-icon mui-icon-arrowdown mui-select-icon"
			});
			div.append(span);
			span.on("tap", function() {
				mui.openWindow({
					url: "OAdropdownPage.html",
					id: "OAdropdownPage" +pdata.NAME + "_" + index,
					extras: {
						data: pdata.NAME + "_" + index,
						uri: uri
					},
					waiting: {
						autoShow: true
					}
				});
			});
		} else {
			var ddata = eval("(" + pdata.IDROP + ")");
			$.each(ddata, function(di, dob) {
				var opt = $("<option/>", {
					"value": dob.id,
					"html": dob.text
				});
				sel.append(opt);
			});
		}
	}

	if(data != null && typeof(data[pdata.NAME]) == "string") {
		$(sel).val(data == null ? "" : data[pdata.NAME].allReplace("<br/>", "\n"));
	} else {
		$(sel).val(data == null ? "" : data[pdata.NAME]);
	}
	div.append(lab).append(sel);
	return div;
}

function f_details_createText(pdata, index, data) {

	var div = $("<div/>", {
		"class": "mui-input-row"
	});
	var lab = $("<label/>", {
		"html": pdata.VAL + "："
	});
	var ipt = $("<input/>", {
		"id": pdata.NAME + "_" + index,
		"placeholder": "请输入" + pdata.VAL,
		"type": pdata.TYP,
		"value": data == null ? "" : data[pdata.NAME]
	});
	switch(pdata.NAME) {
		case "sl":
			ipt.bind("blur", function() {
				var $dj = $("#dj_" + index).val();
				if($dj != "") {
					$("#je_" + index).val($(this).val() * $dj);
				}
			});
			break;
		case "dj":
			ipt.bind("blur", function() {
				var $sl = $("#sl_" + index).val();
				if($sl != "") {
					$("#je_" + index).val($(this).val() * $sl);
				}
			});
			break;
	}
	div.append(lab).append(ipt);
	return div;
}

function f_get_OAdata(tbname, oid, exdata) {
	$.post(Service_url + "efwebservice_oa.asmx/Get_OA_Info", {
		"companyid": plus.storage.getItem("companyID"),
		"tablename": tbname,
		"id": oid,
		"Linces": Linces
	}, function(data) {
		var tdata = "{" + eval("(" + data + ")") + "}";
		var jdata = eval("(" + tdata + ")");
		if(jdata.subinfo != null && jdata.subinfo.length > 0) {
			$.each(jdata.subinfo, function(i, o) {
				f_show_DetailsData(i, o, exdata);
			});
		}
	});
}

function f_show_DetailsData(index, subdata, exdata) {
	if(index == 0) {
		var ediv = $("[name='" + subdata.xmbm + "']");
		if(ediv.length > 0) {
			$.each(ediv, function(i, o) {
				var ipts = $(o).find("input");
				var txts = $(o).find("textarea");
				var sel = $(o).find("select");
				$.each(ipts, function(ii, oo) {
					var keys = $(oo).attr("id").split("_")[0];
					$(oo).val(subdata[keys]);
				});
				$.each(sel, function(ii, oo) {
					var keys = $(oo).attr("id").split("_")[0];
					$(oo).val(subdata[keys]);
				});
				$.each(txts, function(ii, oo) {
					var keys = $(oo).attr("id").split("_")[0];
					if(typeof(subdata[keys]) == "string") {
						$(oo).val(subdata[keys].allReplace("<br/>", "\n"));
					} else {
						$(oo).val(subdata[keys]);
					}
				});
			});
		}
	} else {
		di++;
		if(exdata.cid == subdata.xmbm) {
			var ddiv = f_createDetails(exdata, subdata);
			ddiv.insertBefore($("#btn_" + subdata.xmbm));
		}
	}
}

function f_resetShow() {
	var labs = $(".mui-content label");
	$.each(labs, function(i, o) {
		var h = $(o).height();
		console.log(h);
		if(h + 15 > 40) {
			$(o).parent().height(h + 16);
		}
	});
}

function f_setDropValue(id, text, eid) {
	$("#" + eid).attr("disabled", true);
	$("#" + eid).val(id+"_"+text);
}