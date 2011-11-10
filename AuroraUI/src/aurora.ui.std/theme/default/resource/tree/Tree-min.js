$A.Tree=Ext.extend($A.Component,{showSkeleton:true,sw:18,constructor:function(a){$A.Tree.superclass.constructor.call(this,a);this.context=a.context||""},initComponent:function(a){this.nodeHash={};$A.Tree.superclass.initComponent.call(this,a);this.body=this.wrap.child("div[atype=tree.body]")},processListener:function(a){$A.Tree.superclass.processListener.call(this,a);this.wrap[a]("click",this.onClick,this);this.wrap[a]("dblclick",this.onDblclick,this)},initEvents:function(){$A.Tree.superclass.initEvents.call(this);this.addEvents("render","collapse","expand","click","dblclick")},destroy:function(){$A.Tree.superclass.destroy.call(this)},processDataSetLiestener:function(a){var b=this.dataset;if(b){b[a]("update",this.onUpdate,this);b[a]("load",this.onLoad,this);b[a]("indexchange",this.onIndexChange,this);b[a]("remove",this.onRemove,this)}},bind:function(b){if(typeof(b)==="string"){b=$(b);if(!b){return}}var a=this;a.dataset=b;a.processDataSetLiestener("on");Ext.onReady(function(){a.onLoad()})},onRemove:function(h,a){var f=this.getNodeById(a.id);if(f){var d=f.parentNode;if(d){this.focusNode=(this.focusNode==d?null:this.focusNode);this.unregisterNode(f,true);d.removeChild(f);var b=-1;for(var c=0;c<d.data.children.length;c++){var e=d.data.children[c];if(e.record.id==a.id){b=c;break}}if(b!=-1){var g=d.data;g.children.remove(d.data.children[b]);var h=a.ds;if(g.children[b-1]&&g.children[b-1].record){h.locate(h.indexOf(g.children[b-1].record)+1)}else{if(g.children[b]&&g.children[b].record){h.locate(h.indexOf(g.children[b].record)+1)}else{h.locate(h.indexOf(d.record)+1)}}}}}},onUpdate:function(e,a,b,d){if(this.parentfield==b||b==this.sequencefield){this.onLoad()}else{var c=this.nodeHash[a.id];c.paintText()}},onIndexChange:function(c,a){var b=this.nodeHash[a.id];if(b){this.setFocusNode(b)}},isAllParentExpand:function(a){var b=a.parentNode;return !b||(b.isExpand&&this.isAllParentExpand(b))},onClick:function(d){var c=Ext.fly(d.target).findParent("td");if(!c){return}var a=c._type_;if(typeof(a)===undefined){return}c=Ext.fly(d.target).findParent("div.item-node");if(a=="clip"){if(c.indexId!=null){var b=this.nodeHash[c.indexId];if(b.isExpand){b.collapse();this.fireEvent("collapse",this,b)}else{b.expand();this.fireEvent("expand",this,b)}}}else{if(a=="icon"||a=="text"){var b=this.nodeHash[c.indexId];this.setFocusNode(b);this.dataset.locate(this.dataset.indexOf(b.record)+1,true);this.fireEvent("click",this,b.record,b)}else{if(a=="checked"){var b=this.nodeHash[c.indexId];b.onCheck()}}}},onDblclick:function(d){var c=Ext.fly(d.target).findParent("td");if(!c){return}var a=c._type_;if(typeof(a)===undefined){return}c=Ext.fly(d.target).findParent("div.item-node");if(a=="icon"||a=="text"){var b=this.nodeHash[c.indexId];this.setFocusNode(b);this.dataset.locate(this.dataset.indexOf(b.record)+1,true);this.fireEvent("dblclick",this,b.record,b)}},getRootNode:function(){return this.root},setRootNode:function(a){this.root=a;a.ownerTree=this;this.registerNode(a);a.cascade((function(b){this.registerNode(b)}),this)},getNodeById:function(a){return this.nodeHash[a]},registerNode:function(a){this.nodeHash[a.id]=a},unregisterNode:function(b,c){delete this.nodeHash[b.id];if(c){for(var a=0;a<b.children;a++){this.unregisterNode(b.children[a],c)}}},setFocusNode:function(a){if(this.focusNode){this.focusNode.unselect()}this.focusNode=a;if(a.parentNode){a.parentNode.expand()}a.select()},createNode:function(a){return{record:a,children:[]}},buildTree:function(){var o=[];var n={};var m={};var k=this.dataset.data;var e=k.length;for(var g=0;g<e;g++){var j=k[g];var c=j.get(this.idfield);var d=this.createNode(j);d.checked=(d.record.get(this.checkfield)=="Y")?1:0;d.expanded=d.record.get(this.expandfield)=="Y";n[c]=d;m[c]=d}for(var r in m){var d=m[r];var j=d.record;var h=j.get(this.parentfield);var q=m[h];if(q){q.children.add(d);delete n[r]}}for(var r in n){var d=m[r];o.add(d)}var b=null;if(o.length==1){this.showRoot=true;b=o[0]}else{var f={};f[this.displayfield]="_root";var j=new Aurora.Record(f);j.setDataSet(this.dataset);var p={record:j,children:[]};for(var g=0;g<o.length;g++){p.children.add(o[g])}this.showRoot=false;b=p}var a=function(y){var u=y.children;var x=u.length;for(var t=0;t<x;t++){var w=u[t];if(w.children.length>0){a(w)}}var l=0;for(var t=0;t<x;t++){var v=u[t].checked;if(v==1){l++}}if(l==0){y.checked=0}else{if(x==l){y.checked=1}else{y.checked=2}}};for(var g=0;g<o.length;g++){var s=o[g];a(s)}this.sortChildren(b.children,this.sequencefield);return b},sortChildren:function(b,d){if(d){b.sort(function(f,e){var h=f.record.get(d)||Number.MAX_VALUE;var g=e.record.get(d)||Number.MAX_VALUE;return parseFloat(h)-parseFloat(g)})}else{b.sort()}for(var a=0;a<b.length;a++){var c=b[a];this.sortChildren(c.children,d)}},createTreeNode:function(a){return new $A.Tree.TreeNode(a)},onLoad:function(){var a=this.buildTree();if(!a){return}var b=this.createTreeNode(a);this.setRootNode(b);this.body.update("");if(this.dataset.data.length>0){this.root.render()}this.fireEvent("render",this,a)},getIconByType:function(a){return a},onNodeSelect:function(a){a[this.displayfield+"_text"].style.backgroundColor="#dfeaf5"},onNodeUnSelect:function(a){a[this.displayfield+"_text"].style.backgroundColor=""},initColumns:function(a){}});$A.Tree.TreeNode=function(a){this.init(a)};$A.Tree.TreeNode.prototype={init:function(e){this.data=e;this.record=e.record;this.els=null;this.id=this.record.id;this.parentNode=null;this.childNodes=[];this.lastChild=null;this.firstChild=null;this.previousSibling=null;this.nextSibling=null;this.childrenRendered=false;this.isExpand=e.expanded;this.checked=e.checked;var c=e.children||[];for(var b=0,a=c.length;b<a;b++){var d=this.createNode(c[b]);this.appendChild(d)}},createNode:function(a){return new $A.Tree.TreeNode(a)},createCellEl:function(a){this.els[a+"_text"]=document.createElement("div");this.els[a+"_td"].appendChild(this.els[a+"_text"])},initEl:function(){var b=this.getOwnerTree().displayfield;this.els={};this.els.element=document.createElement("div");this.els.element.className="item-node";this.els.itemNodeTable=document.createElement("table");this.els.itemNodeTable.border=0;this.els.itemNodeTable.cellSpacing=0;this.els.itemNodeTable.cellPadding=0;this.els.itemNodeTbody=document.createElement("tbody");this.els.itemNodeTr=document.createElement("tr");if(this.getOwnerTree().showSkeleton){this.els.line=document.createElement("td");this.els.clip=document.createElement("td");this.els.icon=(this.icon)?document.createElement("img"):document.createElement("div");this.els.iconTd=document.createElement("td");this.els.checkbox=document.createElement("td");Ext.fly(this.els.iconTd).setWidth(18);this.els.iconTd.appendChild(this.els.icon)}this.els[b+"_td"]=document.createElement("td");this.createCellEl(b);this.els[b+"_td"].className="node-text";if(this.getOwnerTree().showSkeleton){this.els.itemNodeTr.appendChild(this.els.line);this.els.itemNodeTr.appendChild(this.els.clip);this.els.itemNodeTr.appendChild(this.els.iconTd);this.els.itemNodeTr.appendChild(this.els.checkbox)}this.els.itemNodeTr.appendChild(this.els[b+"_td"]);this.getOwnerTree().initColumns(this);this.els.itemNodeTbody.appendChild(this.els.itemNodeTr);this.els.itemNodeTable.appendChild(this.els.itemNodeTbody);this.els.element.appendChild(this.els.itemNodeTable);this.els.element.noWrap="true";if(this.getOwnerTree().showSkeleton){this.els.line["_type_"]="line";this.els.line.className="line";this.els.clip["_type_"]="clip";this.els.clip.innerHTML="&#160";this.els.iconTd["_type_"]="icon";this.els.checkbox["_type_"]="checked";this.els.checkbox.innerHTML="&#160"}this.els[b+"_td"]["_type_"]="text";if(this.getOwnerTree().showcheckbox===false){this.els.checkbox.style.display="none"}var a=this.record.get(b);if(this.isRoot()&&a=="_root"){this.els.itemNodeTable.style.display="none"}this.els.child=document.createElement("div");this.els.element.appendChild(this.els.child);this.els.child.className="item-child";this.els.child.style.display="none"},render:function(){var a=this.getOwnerTree();this.icon=this.record.get(a.iconfield);if(!this.els){this.initEl()}if(this.isRoot()){a.body.appendChild(this.els.element);if(this.getOwnerTree().showRoot==false&&this.getOwnerTree().showSkeleton){this.els.icon.style.display=this.els.checkbox.style.display=this.els[a.displayfield+"_text"].style.display="none"}this.expand()}else{this.parentNode.els.child.appendChild(this.els.element);if(this.isExpand){this.expand()}}this.paintPrefix();this.els.element.indexId=this.id;this.paintCheckboxImg()},setWidth:function(b,a){if(this.width==a){return}this.width=a;this.doSetWidth(b,a);if(this.childrenRendered){var e=this.childNodes;for(var c=0;c<e.length;c++){var d=e[c];d.setWidth(b,a)}}},doSetWidth:function(a,h){if(!h){return}if(this.isRoot()){return}var b=0;if(a==this.getOwnerTree().displayfield&&this.getOwnerTree().showSkeleton){var i=this.getOwnerTree().sw;var f=this.getPathNodes();var c=(f.length-2)*(i);var e=i,d=i,g=0;var g=this.getOwnerTree().showcheckbox?i:0;b=c+e+d+g}Ext.fly(this.els[a+"_td"]).setWidth(Math.max((h-b),0));Ext.fly(this.els[a+"_text"]).setWidth(Math.max((h-b-2),0))},paintPrefix:function(){this.paintLine();this.paintClipIcoImg();this.paintCheckboxImg();this.paintIconImg();this.paintText()},paintLine:function(){var b=this.getOwnerTree();if(!b.showSkeleton){return}this.els.line.innerHTML="";var j=this.getPathNodes();var a=(j.length-2)*b.sw;Ext.fly(this.els.line).setWidth(a);if(a==0){this.els.line.style.display="none"}var h=document.createElement("div");Ext.fly(h).setWidth((j.length-2)*b.sw);for(var d=1,g=j.length-1;d<g;d++){var f=j[d];var e=document.createElement("div");if(f.isLast()){e.className="node-empty"}else{e.className="node-line"}h.appendChild(e)}this.els.line.appendChild(h)},paintClipIcoImg:function(){if(!this.getOwnerTree().showSkeleton){return}if(this.isRoot()){this.els.clip.style.display="none";return}var a=this.getOwnerTree();var b="empty";if(!this.isRoot()){if(this.isLeaf()){if(this.isLast()){b="joinBottom"}else{if(this.isFirst()){b="joinTop"}else{b="join"}}}else{if(this.isExpand){if(this.isLast()){b="minusBottom"}else{if(this.isFirst()){b="minusTop"}else{b="minus"}}}else{if(this.isLast()){b="plusBottom"}else{if(this.isFirst()){b="plusTop"}else{b="plus"}}}}}this.els.clip.className="node-clip clip-"+b},paintIconImg:function(){var a=this.getOwnerTree();if(!a.showSkeleton){return}var c=this.data.icon;if(!c){var b=this.data.type;if(b){c=a.getIconByType(b)}if(!c){if(this.isRoot()){c="root"}else{if(this.isLeaf()){c="node"}else{if(this.isExpand){c="folderOpen"}else{c="folder"}}}}}if(this.icon){this.els.icon.className="node-icon";this.els.icon.src=a.context+this.icon}else{this.els.icon.className="node-icon icon-"+c}},paintCheckboxImg:function(){var a=this.getOwnerTree();if(!a.showSkeleton){return}var b=this.checked;if(this.els){this.els.checkbox.className=((b==2)?"checkbox2":(b==1)?"checkbox1":"checkbox0")}},paintText:function(){if(!this.els){return}var a=this.getOwnerTree();var c=this.record.get(a.displayfield);if(!Ext.isEmpty(a.renderer)){var b=window[a.renderer];if(b){c=b.call(this,c,this.record,this)}}this.els[a.displayfield+"_text"].innerHTML=c},paintChildren:function(){if(!this.childrenRendered){this.els.child.innerHTML="";this.childrenRendered=true;var c=this.childNodes;for(var a=0;a<c.length;a++){var b=c[a];b.render()}}},collapse:function(){this.isExpand=false;if(!this.isRoot()){this.record.set(this.getOwnerTree().expandfield,"N")}this.els.child.style.display="none";this.paintIconImg();this.paintClipIcoImg()},expand:function(){if(this.parentNode&&this.parentNode.isExpand==false){this.parentNode.expand()}if(!this.isLeaf()&&this.childNodes.length>0){if(!this.isRoot()){this.record.set(this.getOwnerTree().expandfield,"Y")}this.isExpand=true;this.paintChildren();this.els.child.style.display="block"}this.paintIconImg();this.paintClipIcoImg()},select:function(){this.isSelect=true;this.getOwnerTree().onNodeSelect(this.els)},unselect:function(){this.isSelect=false;if(this.getOwnerTree()){this.getOwnerTree().onNodeUnSelect(this.els)}},getEl:function(){return this.els},setCheckStatus:function(d){if(d==2||d==3){var e=this.childNodes;var c=e.length;if(c==0){this.checked=d==2?0:1}else{var a=0;var f=0;for(var b=0;b<c;b++){var d=e[b].checked;if(d==1){a++}else{if(d==2){f++}}}this.checked=(e.length==a)?1:(a>0||f>0)?2:0}}else{this.checked=d}if(!this.isRoot()){this.record.set(this.getOwnerTree().checkfield,(this.checked==1||this.checked==2)?"Y":"N")}this.paintCheckboxImg()},setCheck:function(a){if(a==true){this.cascade(function(b){b.setCheckStatus(1)});this.bubble(function(b){b.setCheckStatus(3)})}else{this.cascade(function(b){b.setCheckStatus(0)});this.bubble(function(b){b.setCheckStatus(2)})}},onCheck:function(){if(this.checked==0){this.setCheck(true)}else{this.setCheck(false)}},isRoot:function(){return(this.ownerTree!=null)&&(this.ownerTree.root===this)},isLeaf:function(){return this.childNodes.length===0},isLast:function(){return(!this.parentNode?true:this.parentNode.childNodes[this.parentNode.childNodes.length-1]==this)},isFirst:function(){var a=this.getOwnerTree();return(this.parentNode==a.getRootNode()&&!a.showRoot&&(this.parentNode.childNodes[0]==this))},hasChildNodes:function(){return !this.isLeaf()&&this.childNodes.length>0},setFirstChild:function(a){this.firstChild=a},setLastChild:function(a){this.lastChild=a},appendChild:function(e){var f=false;if(e instanceof Array){f=e}else{if(arguments.length>1){f=arguments}}if(f){for(var d=0,a=f.length;d<a;d++){this.appendChild(f[d])}}else{var c=e.parentNode;if(c){c.removeChild(e)}var b=this.childNodes.length;if(b==0){this.setFirstChild(e)}this.childNodes.push(e);e.parentNode=this;var g=this.childNodes[b-1];if(g){e.previousSibling=g;g.nextSibling=e}else{e.previousSibling=null}e.nextSibling=null;this.setLastChild(e);e.setOwnerTree(this.getOwnerTree());if(e&&this.childrenRendered){e.render();if(e.previousSibling){e.previousSibling.paintPrefix()}}if(this.els){this.paintPrefix()}return e}},removeChild:function(b){var a=this.childNodes.indexOf(b);if(a==-1){return false}this.childNodes.splice(a,1);if(b.previousSibling){b.previousSibling.nextSibling=b.nextSibling}if(b.nextSibling){b.nextSibling.previousSibling=b.previousSibling}if(this.firstChild==b){this.setFirstChild(b.nextSibling)}if(this.lastChild==b){this.setLastChild(b.previousSibling)}b.setOwnerTree(null);b.parentNode=null;b.previousSibling=null;b.nextSibling=null;if(this.childrenRendered){if(b.els&&b.els.element){this.els.child.removeChild(b.els.element)}if(this.childNodes.length==0){this.collapse()}}if(this.els){this.paintPrefix()}return b},insertBefore:function(d,a){if(!a){return this.appendChild(d)}if(d==a){return false}var b=this.childNodes.indexOf(a);var c=d.parentNode;var e=b;if(c==this&&this.childNodes.indexOf(d)<b){e--}if(c){c.removeChild(d)}if(e==0){this.setFirstChild(d)}this.childNodes.splice(e,0,d);d.parentNode=this;var f=this.childNodes[e-1];if(f){d.previousSibling=f;f.nextSibling=d}else{d.previousSibling=null}d.nextSibling=a;a.previousSibling=d;d.setOwnerTree(this.getOwnerTree());return d},replaceChild:function(a,b){this.insertBefore(a,b);this.removeChild(b);return b},indexOf:function(a){return this.childNodes.indexOf(a)},getOwnerTree:function(){if(!this.ownerTree){var a=this;while(a){if(a.ownerTree){this.ownerTree=a.ownerTree;break}a=a.parentNode}}return this.ownerTree},getDepth:function(){var b=0;var a=this;while(a.parentNode){b++;a=a.parentNode}return b},setOwnerTree:function(b){if(b!=this.ownerTree){if(this.ownerTree){this.ownerTree.unregisterNode(this)}this.ownerTree=b;var d=this.childNodes;for(var c=0,a=d.length;c<a;c++){d[c].setOwnerTree(b)}if(b){b.registerNode(this)}}},getPathNodes:function(){var a=[];for(var b=this;b!=null;b=b.parentNode){a.push(b)}return a.reverse()},getPath:function(c){c=c||"id";var e=this.parentNode;var a=[this.data[c]];while(e){a.unshift(e.attributes[c]);e=e.parentNode}var d=this.getOwnerTree().pathSeparator;return d+a.join(d)},bubble:function(c,b,a){var d=this;while(d){if(c.call(b||d,a||d)===false){break}d=d.parentNode}},cascade:function(f,e,b){if(f.call(e||this,b||this)!==false){var d=this.childNodes;for(var c=0,a=d.length;c<a;c++){d[c].cascade(f,e,b)}}},findChild:function(d,e){var c=this.childNodes;for(var b=0,a=c.length;b<a;b++){if(c[b].attributes[d]==e){return c[b]}}return null},findChildBy:function(e,d){var c=this.childNodes;for(var b=0,a=c.length;b<a;b++){if(e.call(d||c[b],c[b])===true){return c[b]}}return null},sort:function(e,d){var c=this.childNodes;var a=c.length;if(a>0){var f=d?function(){e.apply(d,arguments)}:e;c.sort(f);for(var b=0;b<a;b++){var g=c[b];g.previousSibling=c[b-1];g.nextSibling=c[b+1];if(b==0){this.setFirstChild(g)}if(b==a-1){this.setLastChild(g)}}}},contains:function(a){var b=a.parentNode;while(b){if(b==this){return true}b=b.parentNode}return false},toString:function(){return"[Node"+(this.id?" "+this.id:"")+"]"}};