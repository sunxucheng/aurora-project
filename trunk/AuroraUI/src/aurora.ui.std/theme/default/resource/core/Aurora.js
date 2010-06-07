/*
 * Aurora UI Library.
 * Copyright(c) 2010, Hand China Co.,Ltd.
 * 
 * http://www.hand-china.com
 */

/**
 * @class Aurora
 * Aurora UI 核心工具类.
 * @author 牛佳庆
 * @singleton
 */
$A = Aurora = {version: '1.0',revision:'$Rev$'};
$A.fireWindowResize = function(){
	$A.Cover.resizeCover();
}
Ext.fly(window).on("resize", $A.fireWindowResize, this);
$A.cache = {};
$A.cmps = {};
$A.onReady = Ext.onReady;
$A.get = Ext.get;
$A.focusWindow;

$A.center = function(el){
	var ele;
	if(typeof(el)=="string"){
        var cmp = $A.CmpManager.get(el)
        if(cmp){
            if(cmp.wrap){
                ele = cmp.wrap;
            }
        }else{
             ele = Ext.get(el);
        }             
    }else{
        ele = Ext.get(el);
    }
    var screenWidth = $A.getViewportWidth();
    var screenHeight = $A.getViewportHeight();
    var x = Math.max(0,(screenWidth - ele.getWidth())/2);
    var y = Math.max(0,(screenHeight - ele.getHeight())/2);
    ele.setStyle('position','absolute');
    ele.moveTo(x,y);
}

/**
 * Copies all the properties of config to obj.
 * @param {Object} obj The receiver of the properties
 * @param {Object} config The source of the properties
 * @param {Object} defaults A different object that will also be applied for default values
 * @return {Object} returns obj
 * @member Ext apply
 */
$A.setTheme = function(theme){
	if(theme) {
		var exp  = new Date();   
	    exp.setTime(exp.getTime() + 24*3600*1000);
	    document.cookie = "app_theme="+ escape (theme) + ";expires=" + exp.toGMTString(); 
	    window.location.reload();
	}
}
$A.CmpManager = function(){
    return {
        put : function(id, cmp){
        	if($A.focusWindow) $A.focusWindow.cmps[id] = cmp;
        	if(!this.cache) this.cache = {};
        	if(this.cache[id] != null) {
	        	alert("错误: ID为' " + id +" '的组件已经存在!");
	        	return;
	        }
        	this.cache[id]=cmp;
        	cmp.on('mouseover',$A.CmpManager.onCmpOver,$A.CmpManager);
        	cmp.on('mouseout',$A.CmpManager.onCmpOut,$A.CmpManager);
        },
        onCmpOver: function(cmp, e){
        	if($A.validInfoType != 'tip') return;
        	if($A.Grid && cmp instanceof $A.Grid){
        		var ds = cmp.dataset;
        		if(!ds||ds.isValid == true)return;
        		var target = Ext.fly(e.target).findParent('td');
                if(target){
                    var atype = Ext.fly(target).getAttributeNS("","atype");
            		if(atype == 'grid-cell'){
            			var rid = Ext.fly(target).getAttributeNS("","recordid");
            			var record = ds.findById(rid);
            			if(record){
                			var name = Ext.fly(target).getAttributeNS("","dataindex");        			
        					var msg = record.valid[name];
        	        		if(Ext.isEmpty(msg))return;
        	        		$A.ToolTip.show(target, msg);
            			}
                    }
        		}
        	}else{
	        	if(cmp.binder){
	        		var ds = cmp.binder.ds;
	        		if(!ds || ds.isValid == true)return;
	        		var record = cmp.record;
	        		if(!record)return;
	        		var msg = record.valid[cmp.binder.name];
	        		if(Ext.isEmpty(msg))return;
	        		$A.ToolTip.show(cmp.id, msg);
	        	}
        	}
        },
        onCmpOut: function(cmp,e){
        	if($A.validInfoType != 'tip') return;
        	$A.ToolTip.hide();
        },
        getAll : function(){
        	return this.cache;
        },
        remove : function(id){
        	var cmp = this.cache[id];
        	cmp.un('mouseover',$A.CmpManager.onCmpOver,$A.CmpManager);
        	cmp.un('mouseout',$A.CmpManager.onCmpOut,$A.CmpManager);
        	delete this.cache[id];
        },
        get : function(id){
        	if(!this.cache) return null;
        	return this.cache[id];
        }
    };
}();
Ext.Ajax.on("requestexception", function(conn, response, options) {
	if($A.slideBarEnable)$A.SideBar.enable = $A.slideBarEnable;
	$A.manager.fireEvent('ajaxerror', $A.manager, response.status, response);
	if($A.logWindow){
		var record = $('HTTPWATCH_DATASET').getCurrentRecord();
		var st = $A['_startTime'];
		var ed = new Date();					
		record.set('spend',ed-st);
		record.set('status',response.status);
		record.set('result',response.statusText);
		record.set('response',response.statusText);
	}
	switch(response.status){
		case 404:
			$A.showErrorMessage('404错误', '未找到"'+ response.statusText+'"');
			break;
		case 500:
            $A.showErrorMessage(response.status + '错误', response.responseText,null,400,250);
            break;
		default:
			$A.showErrorMessage('错误', response.statusText);
			break;
	}	
}, this);
$ = $A.getCmp = function(id){
	var cmp = $A.CmpManager.get(id)
	if(cmp == null) {
		alert('未找到组件:' + id)
	}
	return cmp;
}
$A.getViewportHeight = function(){
    if(Ext.isIE){
        return Ext.isStrict ? document.documentElement.clientHeight :
                 document.body.clientHeight;
    }else{
        return self.innerHeight;
    }
}
$A.getViewportWidth = function() {
    if(Ext.isIE){
        return Ext.isStrict ? document.documentElement.clientWidth :
                 document.body.clientWidth;
    }else{
        return self.innerWidth;
    }
}
$A.request = function(url, para, success, failed, scope){
	$A.manager.fireEvent('ajaxstart', url, para);
	if($A.logWindow){
		$A['_startTime'] = new Date();
		$('HTTPWATCH_DATASET').create({'url':url,'request':Ext.util.JSON.encode({parameter:para})})
	}
	Ext.Ajax.request({
			url: url,
			method: 'POST',
			params:{_request_data:Ext.util.JSON.encode({parameter:para})},
			success: function(response){
				if($A.logWindow){
					var st = $A['_startTime'];
					var ed = new Date();					
					var record = $('HTTPWATCH_DATASET').getCurrentRecord();
					record.set('spend',ed-st);
					record.set('result',response.statusText);
					record.set('status',response.status);
					record.set('response',response.responseText);
				}
				
				$A.manager.fireEvent('ajaxcomplete', url, para,response);
				if(response && response.responseText){
					var res = null;
					try {
						res = Ext.decode(response.responseText);
					}catch(e){
						$A.showErrorMessage('错误', '返回格式不正确!');
					}
					if(res && !res.success){
						$A.manager.fireEvent('ajaxfailed', $A.manager, url,para,res);
						if(res.error){
							if(failed) 
								failed.call(scope, res);
							else
								$A.showWarningMessage('警告', res.error.message);
						}								    						    
					} else {
						$A.manager.fireEvent('ajaxsuccess', $A.manager, url,para,res);
						if(success)success.call(scope,res);
					}
				}
			},
			scope: scope
		});
}
Ext.applyIf(String.prototype, {
	trim : function(){
		return this.replace(/(^\s*)|(\s*$)/g, "");
	}
});
Ext.applyIf(Array.prototype, {
	add : function(o){
		if(this.indexOf(o) == -1)
		this[this.length] = o;
	}
});

$A.TextMetrics = function(){
    var shared;
    return {
        measure : function(el, text, fixedWidth){
            if(!shared){
                shared = $A.TextMetrics.Instance(el, fixedWidth);
            }
            shared.bind(el);
            shared.setFixedWidth(fixedWidth || 'auto');
            return shared.getSize(text);
        }
    };
}();
$A.TextMetrics.Instance = function(bindTo, fixedWidth){
    var ml = new Ext.Element(document.createElement('div'));
    document.body.appendChild(ml.dom);
    ml.position('absolute');
    ml.setLeft(-1000);
    ml.setTop(-1000);    
    ml.hide();
    if(fixedWidth){
        ml.setWidth(fixedWidth);
    }
    var instance = {      
        getSize : function(text){
            ml.update(text);            
            var s=new Object();
            s.width=ml.getWidth();
            s.height=ml.getHeight();
            ml.update('');
            return s;
        },       
        bind : function(el){
        	var a=new Array('font-size','font-style', 'font-weight', 'font-family','line-height', 'text-transform', 'letter-spacing');	
        	var len = a.length, r = {};
        	for(var i = 0; i < len; i++){
                r[a[i]] = Ext.fly(el).getStyle(a[i]);
            }
            ml.setStyle(r);           
        },       
        setFixedWidth : function(width){
            ml.setWidth(width);
        }       
    };
    instance.bind(bindTo);
    return instance;
};
$A.ToolTip = function(){
	q = {
		init: function(){
			var sf = this;
			Ext.onReady(function(){
				var qdom = Ext.DomHelper.append(
				    Ext.getBody(),
				    {
					    tag: 'div',
					    cls: 'tip-wrap',
					    children: [{tag: 'div', cls:'tip-body'}]
				    }
				);
				var sdom = Ext.DomHelper.append(Ext.getBody(),{tag:'div',cls: 'item-shadow'});
				sf.tip = Ext.get(qdom);
				sf.shadow = Ext.get(sdom);
				sf.body = sf.tip.first("div.tip-body");
			})
			
		},
		show: function(el, text){
			if(this.tip == null){
				this.init();
				return;
			}
			this.tip.show();
			this.shadow.show();
			this.body.update(text)
			var ele;
			if(typeof(el)=="string"){
				if(this.sid==el) return;
				this.sid = el;
				var cmp = $A.CmpManager.get(el)
				if(cmp){
					if(cmp.wrap){
						ele = cmp.wrap;
					}
				}				
			}else{
				ele = Ext.get(el);
			}
			this.shadow.setWidth(this.tip.getWidth())
			this.shadow.setHeight(this.tip.getHeight())
			this.correctPosition(ele);
		},
		correctPosition: function(ele){
			var screenWidth = $A.getViewportWidth();
			var x = ele.getX()+ele.getWidth() + 5;
			var sx = ele.getX()+ele.getWidth() + 7;
			if(x+this.tip.getWidth() > screenWidth){
				x = ele.getX() - this.tip.getWidth() - 5;
				sx = ele.getX() - this.tip.getWidth() - 3;
			}
			this.tip.setX(x);
			this.tip.setY(ele.getY());
			this.shadow.setX(sx);
			this.shadow.setY(this.tip.getY()+ 2)
		},
		hide: function(){
			this.sid = null;
			if(this.tip != null) this.tip.hide();
			if(this.shadow != null) this.shadow.hide();
		}
	}
	return q
}();
$A.SideBar = function(){
    var m = {
    	enable:true,
        bar:null,
        show : function(msg){
        	if(!this.enable)return;
            this.hide();
            var p = '<div class="item-slideBar">'+msg+'</div>';
            this.bar = Ext.get(Ext.DomHelper.append(Ext.getBody(),p));
            this.bar.setStyle('z-index', 999999);
            var sf = this;
            this.bar.animate({height: {to: 50, from: 0}},0.35,function(){
                setTimeout(function(){
                   sf.hide();
                }, 2000);            
            },'easeOut','run');
        },
        hide : function(){
            if(this.bar) {
                Ext.fly(this.bar).remove();
                this.bar = null;
            }
        }
    }
    return m;
}();
$A.Status = function(){
    var m = {
        bar:null,
        enable:true,
        show : function(msg){
        	if(!this.enable)return;
        	this.hide();
            var p = '<div class="item-statusBar" unselectable="on">'+msg+'</div>';
            this.bar = Ext.get(Ext.DomHelper.append(Ext.getBody(),p));
            this.bar.setStyle('z-index', 999998);
        },
        hide : function(){
            if(this.bar) {
                Ext.fly(this.bar).remove();
                this.bar = null;
            }
        }
    }
    return m;
}();
$A.Cover = function(){
	var m = {
		container: {},
		cover : function(el){
			var scrollWidth = Ext.isStrict ? document.documentElement.scrollWidth : document.body.scrollWidth;
    		var scrollHeight = Ext.isStrict ? document.documentElement.scrollHeight : document.body.scrollHeight;
    		var screenWidth = Math.max(scrollWidth,$A.getViewportWidth());
    		var screenHeight = Math.max(scrollHeight,$A.getViewportHeight())
			var p = '<DIV class="aurora-cover" style="left:0px;top:0px;width:'+screenWidth+'px;height:'+screenHeight+'px;POSITION: absolute;FILTER: alpha(opacity=30);BACKGROUND-COLOR: #000000; opacity: 0.3; MozOpacity: 0.3" unselectable="on"></DIV>';
			var cover = Ext.get(Ext.DomHelper.append(Ext.getBody(),p));
	    	cover.setStyle('z-index', Ext.fly(el).getStyle('z-index') - 1);
	    	$A.Cover.container[el.id] = cover;
		},
		uncover : function(el){
			var cover = $A.Cover.container[el.id];
			if(cover) {
				Ext.fly(cover).remove();
				$A.Cover.container[el.id] = null;
				delete $A.Cover.container[el.id];
			}
		},
		resizeCover : function(){
			var scrollWidth = Ext.isStrict ? document.documentElement.scrollWidth : document.body.scrollWidth;
    		var scrollHeight = Ext.isStrict ? document.documentElement.scrollHeight : document.body.scrollHeight;
    		var screenWidth = Math.max(scrollWidth,$A.getViewportWidth());
    		var screenHeight = Math.max(scrollHeight,$A.getViewportHeight())
			for(key in $A.Cover.container){
				var cover = $A.Cover.container[key];
				Ext.fly(cover).setWidth(screenWidth);
				Ext.fly(cover).setHeight(screenHeight);
			}		
		}
	}
	return m;
}();
Ext.Element.prototype.update = function(html, loadScripts, callback){
    if(typeof html == "undefined"){
        html = "";
    }
    if(loadScripts !== true){
        this.dom.innerHTML = html;
        if(typeof callback == "function"){
            callback();
        }
        return this;
    }
    var id = Ext.id();
    var dom = this.dom;

    html += '<span id="' + id + '"></span>';
    Ext.lib.Event.onAvailable(id, function(){
    	var links = [];
    	var scripts = [];
        var hd = document.getElementsByTagName("head")[0];
        for(var i=0;i<hd.childNodes.length;i++){
        	var he = hd.childNodes[i];
        	if(he.tagName == 'LINK') {
        		links.push(he.href);
        	}else if(he.tagName == 'SCRIPT'){
        		scripts.push(he.src);
        	}
        }
        var jsre = /(?:<script([^>]*)?>)((\n|\r|.)*?)(?:<\/script>)/ig;
        var jsSrcRe = /\ssrc=([\'\"])(.*?)\1/i;
        
        var cssre = /(?:<link([^>]*)?>)((\n|\r|.)*?)/ig;
        var cssHreRe = /\shref=([\'\"])(.*?)\1/i;
		
		var cssm;
		while(cssm = cssre.exec(html)){
			var attrs = cssm[1];
			var srcMatch = attrs ? attrs.match(cssHreRe) : false;
			if(srcMatch && srcMatch[2]){
				var included = false;
				for(var i=0;i<links.length;i++){
					var link = links[i];
					if(link.indexOf(srcMatch[2]) != -1){
						included = true;
						break;
					}
				}
				if(!included) {
                	var s = document.createElement("link");
					s.type = 'text/css';
					s.rel = 'stylesheet';
                   	s.href = srcMatch[2];
                   	hd.appendChild(s);
                }
			}
		}
        var match;
        var jslink = [];
        var jsscript = [];
        while(match = jsre.exec(html)){
            var attrs = match[1];
            var srcMatch = attrs ? attrs.match(jsSrcRe) : false;
            if(srcMatch && srcMatch[2]){
            	var included = false;
				for(var i=0;i<scripts.length;i++){
					var script = scripts[i];
					if(script.indexOf(srcMatch[2]) != -1){
						included = true;
						break;
					}
				}
               	if(!included) {
               		jslink[jslink.length] = {
               			src:srcMatch[2],
               			type:'text/javascript'
               		}
               	} 
            }else if(match[2] && match[2].length > 0){
            	jsscript[jsscript.length] = match[2];
            }
        }
        var loaded = 0;
        for(var i = 0,l=jslink.length;i<l;i++){
        	var js = jslink[i];
        	var s = document.createElement("script");
            s.src = js.src;
            s.type = js.type;
            s[Ext.isIE ? "onreadystatechange" : "onload"] = function(){
            	var isready = Ext.isIE ? (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") : true;
            	if(isready) {            		
	            	loaded ++;
	            	if(loaded==jslink.length) {
	                    for(j=0,k=jsscript.length;j<k;j++){
		                	var jst = jsscript[j];
		                	if(window.execScript) {
		                    	window.execScript(jst);
		                    } else {
		                    	window.eval(jst);
		                    }
		                }
//		                if(typeof callback == "function"){
//				            callback();
//				        }
	            	}
            	}
            };
			hd.appendChild(s);
        }
        if(jslink.length ==0) {
        	for(j=0,k=jsscript.length;j<k;j++){
            	var jst = jsscript[j];
            	if(window.execScript) {
                   window.execScript(jst);
                } else {
                   window.eval(jst);
                }
            }
//            if(typeof callback == "function"){
//	            callback();
//	        }
        }        
        var el = document.getElementById(id);
        if(el){Ext.removeNode(el);} 
	    Ext.fly(dom).setStyle('display', 'block');
	    if(typeof callback == "function"){
                callback();
        }
    });
    Ext.fly(dom).setStyle('display', 'none');
    dom.innerHTML = html.replace(/(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig, "").replace(/(?:<link.*?>)((\n|\r|.)*?)/ig, "");
    return this;
}

Ext.EventObjectImpl.prototype['isSpecialKey'] = function(){
    var k = this.keyCode;
    return (this.type == 'keypress' && this.ctrlKey) || k==8 || k== 46 || k == 9 || k == 13  || k == 40 || k == 27 || k == 44 ||
    (k == 16) || (k == 17) ||
    (k >= 18 && k <= 20) ||
    (k >= 33 && k <= 35) ||
    (k >= 36 && k <= 39);
}
$A.parseDate = function(str){
	if(typeof str == 'string'){  
		//TODO:临时, 需要服务端解决
		if(str.indexOf('.0') !=-1) str = str.substr(0,str.length-2);
		
		var results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) *$/);      
		if(results && results.length>3)      
	  		return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]));       
		results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);      
	    if(results && results.length>6)      
    	return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]),parseInt(results[6]));       
	}      
  	return null;      
}
Aurora.formateDate = function(date){
	if(!date)return '';
	if(date.getFullYear){
		return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate()
	}else{
		return date
	}
}
Aurora.formateDateTime = function(date){
	if(!date)return '';
	if(date.getFullYear){
		return date.getFullYear() + 
		"-" + (date.getMonth()+1) + 
		"-" + date.getDate() + 
		" " + date.getHours() + 
		":" + date.getMinutes() + 
		":" + date.getSeconds();
		
	}else{
		return date
	}
}
$A.EventManager = Ext.extend(Ext.util.Observable,{
	constructor: function() {
		$A.EventManager.superclass.constructor.call(this);
		this.initEvents();
	},
	initEvents : function(){
    	this.addEvents(
    		'ajaxerror',
    		'ajaxsuccess',
    		'ajaxfailed',
    		'ajaxstart',
    		'ajaxcomplete',
    		'valid',
	        'timeout'
		);    	
    }
});
$A.manager = new $A.EventManager();
$A.manager.on('ajaxstart',function(){
    $A.Status.show('正在请求数据....');   
})
$A.manager.on('timeout',function(){
    $A.Status.hide();
})
$A.manager.on('ajaxerror',function(){
    $A.Status.hide();
})
$A.manager.on('ajaxcomplete',function(){
    $A.Status.hide();
})
$A.manager.on('ajaxsuccess',function(){
    $A.SideBar.show('操作成功!')
})

$A.regEvent = function(name, hanlder){
	$A.manager.on(name, hanlder);
}

$A.validInfoType = 'area';
$A.validInfoTypeObj = '';
$A.setValidInfoType = function(type, obj){
	$A.validInfoType = type;
	$A.validInfoTypeObj = obj;
}

$A.invalidRecords = {};
$A.addInValidReocrd = function(id, record){
	var rs = $A.invalidRecords[id];
	if(!rs){
		$A.invalidRecords[id] = rs = [];
	}
	var has = false;
	for(var i=0;i<rs.length;i++){
		var r = rs[i];
		if(r.id == record.id){
			has = true;
			break;
		}
	}
	if(!has) {
		rs.add(record)
	}
}
$A.removeInvalidReocrd = function(id,record){
	var rs = $A.invalidRecords[id];
	if(!rs) return;
	for(var i=0;i<rs.length;i++){
		var r = rs[i];
		if(r.id == record.id){
			rs.remove(r)
			break;
		}
	}
}
$A.getInvalidRecords = function(pageid){
	var records = [];
	for(var key in $A.invalidRecords){
		var ds = $A.CmpManager.get(key)
		if(ds.pageid == pageid){
			var rs = $A.invalidRecords[key];
			records = records.concat(rs);
		}
	}
	return records;
}
$A.isInValidReocrdEmpty = function(pageid){
	var isEmpty = true;
	for(var key in $A.invalidRecords){
		var ds = $A.CmpManager.get(key)
		if(ds.pageid == pageid){
			var rs = $A.invalidRecords[key];
			if(rs.length != 0){
				isEmpty = false;
				break;
			}
		}
	}
	return isEmpty;
}
$A.manager.on('valid',function(manager, ds, valid){
	switch($A.validInfoType){
		case 'area':
			$A.showValidTopMsg(ds);
			break;
		case 'message':
			$A.showValidWindowMsg(ds);
			break;
	}
})
$A.showValidWindowMsg = function(ds) {
	var empty = $A.isInValidReocrdEmpty(ds.pageid);
	if(empty == true){
		if($A.validWindow)$A.validWindow.close();
	}
	if(!$A.validWindow && empty == false){
		$A.validWindow = $A.showWarningMessage('校验失败','',400,200);
		$A.validWindow.on('close',function(){
			$A.validWindow = null;			
		})
	}
	var sb =[];
	var rs = $A.getInvalidRecords(ds.pageid);
	for(var i=0;i<rs.length;i++){
		var r = rs[i];
		var index = r.ds.data.indexOf(r)+1
		sb[sb.length] ='记录<a href="#" onclick="$(\''+r.ds.id+'\').locate('+index+')">('+r.id+')</a>:';

		for(var k in r.valid){
			sb[sb.length] = r.valid[k]+';'
		}
		sb[sb.length]='<br/>';
	}
	if($A.validWindow)$A.validWindow.body.child('div').update(sb.join(''))
}
$A.pageids = [];
$A.showValidTopMsg = function(ds) {
	var empty = $A.isInValidReocrdEmpty(ds.pageid);
	if(empty == true){
		var d = Ext.get(ds.pageid+'_msg');
		if(d){
			d.hide();
			d.setStyle('display','none')
			d.update('');
		}
		return;
	}
	var rs = $A.getInvalidRecords(ds.pageid);
	var sb = [];
	for(var i=0;i<rs.length;i++){
		var r = rs[i];
		var index = r.ds.data.indexOf(r)+1
		sb[sb.length] ='记录<a href="#" onclick="$(\''+r.ds.id+'\').locate('+index+')">('+r.id+')</a>:';

		for(var k in r.valid){
			sb[sb.length] = r.valid[k]+';'
		}
		sb[sb.length]='<br/>';		
	}
	var d = Ext.get(ds.pageid+'_msg');
	if(d){
		d.update(sb.join(''));
		d.show(true);
	}					
}
Ext.get(document.documentElement).on('keydown',function(e){
	if(e.shiftKey&&e.keyCode == 76){
		if(!$A.logWindow) {
			$A.logWindow = new $A.Window({modal:false, url:'log.screen',title:'AjaxWatch', height:550,width:530});	
			$A.logWindow.on('close',function(){
				delete 	$A.logWindow;		
			})
		}
	}
})
$A.setValidInfoType('tip'); 