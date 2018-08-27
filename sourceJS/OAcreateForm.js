function f_createForm(exdata, odata) {
	var hasDetails = false;
	$("#title").html(exdata.templetname);
	var templet_columntype = exdata.templet_columntype.split(",");
	var templet_formdata = eval("(" + exdata.templet_formdata + ")");
	var templet_parameterdata = eval("(" + exdata.templet_parameterdata + ")");
	$("#form_group").empty();
	$("#details_group").empty();
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
				$("#details_group").append(f_createDetails(templet_parameterdata[i]));
				var btnAdd = $("<button>", {
					"html": "增加",
					"class": "mui-btn mui-btn-danger mui-btn-outlined",
					"style": "width:100%;background-color:#FFF;margin-top:5px;",
					"id": "btn_" + templet_parameterdata[i].cid
				});
				btnAdd.bind("tap", function() {
					if(!details_IsEdit) {
						mui.toast("您没有权限增加!");
						return;
					}
					di++;
					var div = f_createDetails(templet_parameterdata[i]);
					div.insertBefore($(this));
				});
				$("#details_group").append(btnAdd);
				hasDetails = true;
				break;
		}
	});
	if(odata != null) {
		f_setData(odata, exdata);
		f_getEnabledColumn(odata, exdata);
	}
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
			"id":pdata.cid
		});
		var uri = pdata.PURL;
		var span=$("<span/>",{
			"class":"mui-icon mui-icon-arrowdown mui-select-icon"
		});
		div.append(span);
		span.on("tap", function() {
			if(!strIsEmpty($("#"+pdata.cid).attr("No"))) return;
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
		if(!details_IsEdit) {
			mui.toast("您没有权限删除!");
			return;
		}
		card_div.remove();
	});
	header_div.append(delBtn);
	content_div.append(inner_div);
	card_div.append(header_div).append(content_div);
	return card_div;
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
				"id": pdata.NAME + "_" + index
			});
			var uri = pdata.IDROP;
			var span=$("<span/>",{
				"class":"mui-icon mui-icon-arrowdown mui-select-icon"
			});
			div.append(span);
			span.on("tap", function() {
				if(!details_IsEdit) return;
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

function f_getEnabledColumn(o, exdata) {
	$.post(Service_url + "efwebservice_oa.asmx/Server_Templet_Review_FindById_TopCol", {
		companyid: exdata.companyid,
		templetid: exdata.templetid,
		review_id: o.status_review,
		Linces: Linces
	}, function(data) {
		var jdata = eval("(" + data + ")");
		if(jdata) {
			o.modi_columns = jdata.modi_columns;
			f_setEnabled(o, exdata);
		}
	});
}
var details_IsEdit = false;

function f_setEnabled(o, exdata) {
	var columns = o.modi_columns;
	var templet_parameterdata = eval("(" + exdata.templet_parameterdata + ")");
	$.each(templet_parameterdata, function(i, xo) {
		$.each(o, function(k) {
			var ise = strIsEmpty(columns) || xo.cid.indexOf(columns) == -1;
			$("#" + xo.cid).attr("disabled", ise);
			if(xo.TYP == "checkbox") {
				$("input:checkbox[name='" + xo.cid + "']").attr("disabled", ise);
			}
			if(xo.TYP == "radio") {
				$("input:radio[name='" + xo.cid + "']").attr("disabled", ise);
			}
			if(xo.TYP == "details") {
				details_IsEdit = !ise;
				$("#details_group input").attr("disabled",!details_IsEdit);
				$("#details_group select").attr("disabled",!details_IsEdit);
				$("#details_group textarea").attr("disabled",!details_IsEdit);
				if(!details_IsEdit){
					var h= $("#details_group").height();
					$("#details_group").attr("style","margin-bottom: 5px;");
					$("#details_group button").hide();	
				}
			}
			if(xo.TYP=="dropdown" && ise){
				$("#" + xo.cid).attr("No","yes");
			}
		});
	});
}

function f_setData(o, exdata) {
	var templet_parameterdata = eval("(" + exdata.templet_parameterdata + ")");
	$.each(templet_parameterdata, function(i, xo) {
		$.each(o, function(k) {
			if(k == xo.cid) {
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
}

function f_saveModi(exdata, callback) {
	var oid = $("#OAid").val();
	if(!strIsEmpty(oid)) {
		showWaitting();
		var columnData = eval("(" + exdata.templet_parameterdata + ")");
		var gdata = {},
			gv = "",
			details_data = null;
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
					if(details_IsEdit) {
						details_data = f_getDetails_Data(o);
					}
					break;
			}
		});

		$.post(Service_url + 'efwebservice_oa.asmx/Update_OA_Info', {
			companyid: exdata.companyid,
			tablename: exdata.templetid,
			id: oid,
			objvalue: JSON.stringify(gdata),
			operatetype: "S",
			lat: $("#OAlat").val(),
			lng: $("#OAlng").val(),
			objvalue_sub: details_data == null ? "" : JSON.stringify(details_data),
			Linces: Linces
		}, function(o) {
			plus.nativeUI.closeWaiting();
			var rst = eval("(" + o + ")");
			if(rst.indexOf("错误") == -1) {
				callback(true);
				mui.toast("保存修改成功");
			} else {
				callback(false);
				plus.nativeUI.alert(rst, null, "提示信息");
			}
		});
	} else {
		callback(true);
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

function f_setDropValue(id, text, eid) {
	$("#" + eid).attr("disabled", true);
	$("#" + eid).val(id+"_"+text);
}