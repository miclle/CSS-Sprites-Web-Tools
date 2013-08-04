
/**
 * 文档加载完成后
 */
$(document).ready(function(){
	
	initWorkbenchSize();	/**初始化工作台尺寸*/
	
	shortcuts();	/**加载快捷键*/
	
	initToolBtn();	/**初始化工具按钮事件*/
	
	toolBtnClick();	/**工具按钮被点击*/
	
	$("#toolPointer").click();	/**初始点击pointer按钮*/
	
	daggleHand();	/**拖曳*/
	
	createSprite();	/**创建CSS Sprite*/
	
	dialog();	/**弹出框*/
	
	initInnerTip();	/** Sprite内部提示*/
	
	/**
	 ****************
	 * 页面窗口改变大小时
	 ****************
	 */
	$(window).resize(function(){	
		initWorkbenchSize();
		adjustDaggleMask();
		adjustDialog();
	});
});


var CSWT = new function(){				//声明CSWT(CSS Sprite Web Tool)静态类
	
	/**默认参数设置**/
	this.defaultMoveDirection = 1;			//默认移动的距离
	this.defaultFineTuning = 1;					//默认微调的距离
	this.defaultMinSize = 5;						//默认最小的尺寸
	
	/**工具状态**/
	this.mouseDown = false;			//鼠标被按
	this.mouseX = 0;						//鼠标坐标X值
	this.mouseY = 0;						//鼠标坐标Y值
	
	this.spaceKeyDown = false;	//空格键
	
	/**属性设置**/
	this.currentToolBtn = new String();				//当前选择的工具
	
	this.SpriteList = new Array();					//所有CSS Sprite集合

	this.currentSprite = null;							//当前选择编辑的DIV ICO Sprite,初始化为null
	
	this.setCurrentSprite = function(sprite){	//设置一个当前编辑的Sprite,并打开提示
		this.currentSprite = sprite;
		setInnerTip();													//设置内部提示
	};
	
	this.getSprite = function($sprite){				//根据一个jQuery dom对象,在CSS Sprite集合中将它找出,并返回一个Sprite对象
		for(var i=0; i<this.SpriteList.length; i++){
			if( this.SpriteList[i].$sprite.attr("id") == $sprite.attr("id")){
				return this.SpriteList[i];
			}
		}
	};
	
	this.updateSprite = function($sprite){	//根据一个jQuery dom对象,更新在CSS Sprite集合中存在的Sprite对象,并设置为当前编辑的Sprite
		var sprite = CSWT.getSprite($sprite);
		CSWT.setCurrentSprite(sprite.setSprite(sprite,$sprite));
	};
	
	this.deleteSprite = function(Sprite){		//删除一个在CSS Sprite集合中存在的Sprite对象,并同时删除这个对象的在页面上存在的jQuery属性对象
		if(Sprite==null) return;
		for(var i=0; i<this.SpriteList.length; i++){
			if( this.SpriteList[i] == Sprite ){
				Sprite.$sprite.remove();
				$("#innerTip").hide();
				this.SpriteList.splice(i,0);
				CSWT.currentSprite = null;
				return;
			}
		}
	};
	
	
}

/**
 * 创建一个Sprite类
 * @param {Object} $sprite
 */
var Sprite = function($sprite){
	this.$sprite;
	
	this.name;	/** id or class 该属性用来保存Sprite 样式名称 */
	this.width;
	this.height;
	this.backgroundPosition;	/** 保存 background-position 值 */

	this.resizableWrap;
	
	this.init($sprite);		/** 调用初始方法 */
}

Sprite.prototype = {
	
	/**
	 * @param {Sprite Object} Sprite
	 * @param {jQuery Object} $sprite
	 */
	setSprite : function(Sprite,$sprite){		//根据一个jQuery对象,设置一个Sprite对象的属性,并返回该对象
		Sprite.$sprite = $sprite;
		
		if(!Sprite.name){	//当name为空时,默认为$sprite的id
			Sprite.name = "."+$sprite.attr("id");
		}
		
		Sprite.width = Sprite.$sprite.width();
		Sprite.height = Sprite.$sprite.height();
		
		var icons = $("#icons");
		var iconsImg = $("#icons img");
		
		Sprite.backgroundPosition = {
			x : iconsImg.position().left + 1 - Sprite.$sprite.css("left").slice(0,-2),
			y : iconsImg.position().top + 1 - Sprite.$sprite.css("top").slice(0,-2)
		};
		
		return Sprite;
	},
	
	init : function($sprite){		//初始化方法,在new一个Sprite时,调用该方法
		
		this.setSprite(this,$sprite);		//设置属性
		
		CSWT.SpriteList.push(this);			//将该Sprite对象加入SpriteList数组中
		
		CSWT.setCurrentSprite(this);		//设置该Sprite对象为当前选中的对象
		
		var innerTip = $("#innerTip");
		
		$sprite.mousedown(function(){				//给jQuery对象注册mousedown点击事件
			innerTip.hide();
			$(".spriteCurrent").removeClass("spriteCurrent").addClass("spriteReset");		//
			$sprite.addClass("spriteCurrent").removeClass("spriteReset");
		});
		
		$sprite.mouseup(function(){				//给jQuery对象注册mouseup点击事件
			CSWT.updateSprite($(this));
			innerTip.show();
		});
		
	}
	
}

/**
 ****************
 * 创建CSS Sprite
 ****************
 */
function createSprite(){
	var workbench = $("#workbench");
	var maskSprites = $("#maskSprites");
	var maskIcons = $("#maskIcons");
	var innerTip = $("#innerTip");
	
	var idPostfix;
	
	maskIcons.mousedown(function(e){
		if(!$("#icons img").length){
			return;
		}
		
		if(e.which == 1){ // 1 == left; 2 == middle; 3 == right
			$("#innerTip").hide();
			CSWT.mouseX = e.clientX;
			CSWT.mouseY = e.clientY;
			CSWT.mouseDown = true;
			idPostfix = (new Date).getTime();
			maskSprites.show();
		}
	});
	
	maskSprites.mouseup(function(){
		
		var $sprite = $("#sprite"+idPostfix);
		
		if($sprite.length){
			var sprite = new Sprite($sprite);
			
			$sprite.draggable();	//拖动
			
			$sprite.resizable({
				handles: 'se'
			});
		}
		
		CSWT.mouseDown = false;
		maskSprites.hide();
	
	});
	
	maskSprites.mousemove(function(e){
		
		if( !CSWT.mouseDown ){
			return;
		}
		
		var x = e.clientX;
		var y = e.clientY;
		
		
		var $sprite = $("#sprite"+idPostfix);
		
		if(!$sprite.length){		//
			if($(".spriteCurrent").length){
				$(".spriteCurrent").removeClass("spriteCurrent").addClass("spriteReset");
			}
			$sprite = $('<div />')
				.addClass("sprite spriteCurrent")
				.attr({ id:"sprite"+idPostfix, "unselectable":"on"})
				.css({"-moz-user-select": "none"})
				.Opacity(50);
						
			workbench.prepend($sprite);
			
		}
		
		var width = Math.abs(x-CSWT.mouseX);
		var height = Math.abs(y-CSWT.mouseY)
		
		$sprite.width(width);
		$sprite.height(height);
		
		var scrollLeft = workbench.scrollLeft();
		var scrollTop = workbench.scrollTop()
				
		if( x>CSWT.mouseX && y>CSWT.mouseY ){	//右下		OK
			$sprite.css({ top:CSWT.mouseY+scrollTop, left:CSWT.mouseX+scrollLeft});
		}
		
		if( x>CSWT.mouseX && y<CSWT.mouseY ){	//右上
			$sprite.css({ top: y+scrollTop, left: CSWT.mouseX+scrollLeft});
		}
		
		if( x<CSWT.mouseX && y>CSWT.mouseY ){	//左下		OK
			$sprite.css({ top:CSWT.mouseY+scrollTop, left:x+scrollLeft});
		}
		
		if( x<CSWT.mouseX && y<CSWT.mouseY ){	//左上		
			$sprite.css({ top: y+scrollTop, left: x+scrollLeft});
		}
		
		$("#bottomTip")
		.html("MouseDownO:"+CSWT.mouseX+" | "+CSWT.mouseY+" --- Coordinate:"+x + " | " + y + " ---- " + $sprite.attr("id")+" 偏移量:top:"+scrollTop+" left:"+scrollLeft);
		
	});
	
}


/**
 ****************
 * Sprite内部提示
 ****************
 */
function initInnerTip(){
	
	var innerTip = $("#innerTip");
			innerTip.Opacity(20);
	
	innerTip.mousemove(function(){
		innerTip.Opacity(100);
	});
	
	innerTip.draggable({
  	handle: 'div.title'
  });
	
	$("#tipClose").click(function(){
		innerTip.hide();
	});
	
}

/**
 ****************
 * 设置Sprite内部提示
 ****************
 */
function setInnerTip(){
			
	var cs = CSWT.currentSprite;
	
	$("#spriteName").val(cs.name);
	$("#spriteWidth").val(cs.width);
	$("#spriteHeight").val(cs.height);
	
	$("#spriteLeft").val(-cs.backgroundPosition.x);
	$("#spriteTop").val(-cs.backgroundPosition.y);
	
	$("#spritePreviewArea").html("<div></div>");
	$("#spritePreviewArea div")
		.width(cs.width)
		.height(cs.height)
		.css({
			"background-image":"url(upload/ico.gif)",
			"background-position":cs.backgroundPosition.x+"px "+cs.backgroundPosition.y+"px"
		});
	adjustInnerTip().show();
	adjustInnerTipOpacity();
}

/**
 ****************
 * 调整Sprite内部提示位置
 ****************
 */
function adjustInnerTip(){
	var innerTip = $("#innerTip");
	var cs = CSWT.currentSprite;
	
	if(cs){
		var _top;
		_top = cs.$sprite.offset().top - 65 - 55  > 0 
			? cs.$sprite.css("top").slice(0,-2) - 55 +"px"
			: cs.$sprite.css("top").slice(0,-2) +"px"
		
		var _left;
		_left = $("#workbench").width() - cs.$sprite.offset().left - cs.$sprite.width() -100 > innerTip.width()
		 ? cs.$sprite.css("left").slice(0,-2) - 0 + cs.$sprite.width() + 100 +"px"
		 : cs.$sprite.css("left").slice(0,-2) - 0 - innerTip.width() - 100 +"px"
		
		innerTip.css({
			top : _top,
			left: _left
		});	
	}
	
	return innerTip;
}

/**
 ****************
 * 调整Sprite内部提示透明度
 ****************
 */
function adjustInnerTipOpacity(){
	var defOpacity = 20;
	var affectArea = 100;
	$("#maskIcons").mousemove(function(e){
		var innerTip = $("#innerTip:visible");
		
		if(!innerTip.length)
			return
			
		var x = e.clientX;
		var itol = innerTip.offset().left;
		var itwidth = innerTip.width();
		
		var min = itol - affectArea;
		var max = itol + itwidth + affectArea;
		
		if( min < x && x < itol){
			innerTip.Opacity(defOpacity+(x-min)/affectArea*100);
		}
		if(itol+itwidth < x && x < max){
			innerTip.Opacity(defOpacity+(max-x)/affectArea*100);
		}
		
	});
}

/**
 ****************
 * 初始化工作台尺寸
 ****************
 */
function initWorkbenchSize(){

	var _window = $(window);
	var windowWidth = _window.width();
	var windowHeight = _window.height();
	
	var workbench = $("#workbench");
			workbench.height(windowHeight);
			workbench.attr({"unselectable":"on"});
//			workbench.css({"-moz-user-select": "none"});
			workbench.scroll(function(){
				adjustSpritesAndIconsMask();
				adjustDaggleMask();
			});
	
	adjustSpritesAndIconsMask();
	
	var mask = $("#mask");
			mask.Opacity(50);
			mask.height(windowHeight);
	
	
}

/**
 ****************
 * 初始化按钮事件
 ****************
 */
function initToolBtn(){
	$("#toolbar ul li").hover(
	  function () {
	    $(this).addClass("hover");
	  },
	  function () {
	    $(this).removeClass("hover");
	  }
	);
}

/**
 ****************
 * 工具按钮被点击
 ****************
 */
function toolBtnClick(){
	var workbench = $("#workbench");
	$("#toolbar ul li .tb").click(function(){
		var btn = $(this);
		$(".toolBtnCurrent").removeClass("toolBtnCurrent");
		btn.addClass("toolBtnCurrent");
		CSWT.currentToolBtn = btn.attr("id");
		
		/**
		 * Bug Modify
		 */
		if( CSWT.currentToolBtn == "toolHand" ){
			$("#maskIcons").css({"z-index":2003});
		}
		else{
			$("#maskIcons").css({"z-index":3});
		}
		
	});
}

/**
 ****************
 * 调整 Sprites 和 Icons 遮罩
 ****************
 */
function adjustSpritesAndIconsMask(){
	
	var workbench = $("#workbench");
	
	var maskSprites = $("#maskSprites")
				.attr({"unselectable":"on"})
				.css({"-moz-user-select": "none"})
				.empty()
				.Opacity(0);
	
	var maskIcons = $("#maskIcons")
				.attr({"unselectable":"on"})
				.css({"-moz-user-select": "none"})
				.empty()
				.Opacity(0);
	
	var width = workbench.width();
	var heigth = workbench.height();
	var scrollWidth = workbench.attr("scrollWidth");
	var scrollHeight = workbench.attr("scrollHeight");
	
	if($.browser.msie){
		maskSprites.width(width>scrollWidth?width:scrollWidth);
		maskSprites.height(heigth>scrollHeight?heigth:scrollHeight);
		
		maskIcons.width(width>scrollWidth?width:scrollWidth);
		maskIcons.height(heigth>scrollHeight?heigth:scrollHeight);
	}
	else{
		maskSprites.width(scrollWidth);
		maskSprites.height(scrollHeight);
		
		maskIcons.width(scrollWidth);
		maskIcons.height(scrollHeight);
	}
	
	return maskIcons;
	
}

/**
 ****************
 * 调整拖曳遮罩
 *****************
 */
function adjustDaggleMask(){
	var workbench = $("#workbench");
	var maskDaggle = $("#maskDaggle");
	
	var width = workbench.width();
	var heigth = workbench.height();
	var scrollWidth = workbench.attr("scrollWidth");
	var scrollHeight = workbench.attr("scrollHeight");
	
	if($.browser.msie){
		maskDaggle.width(width>scrollWidth?width:scrollWidth);
		maskDaggle.height(heigth>scrollHeight?heigth:scrollHeight);
	}
	else{
		maskDaggle.width(scrollWidth);
		maskDaggle.height(scrollHeight);
	}
	
	return maskDaggle;
}

/**
 ****************
 * 拖曳工作台(画布)
 *****************
 */
function daggleHand(){
	
	var workbench = $("#workbench");

	/** 拖曳遮罩 */
	var maskDaggle = $("#maskDaggle");
			maskDaggle.css({"-moz-user-select": "none"});
			maskDaggle.attr({"unselectable":"on"});
			maskDaggle.Opacity(10);
	
	$(document).bind('keydown','space',function (evt){		//当空格键按下时
		
		if( CSWT.currentToolBtn == "toolHand" ){
			return false;
		}
		
		if(CSWT.spaceKeyDown == true){
			return false;
		}
		
		CSWT.spaceKeyDown = true;
		
		adjustDaggleMask().show();
		
		maskDaggle.addClass("openhand");
		$(".toolBtnCurrent").removeClass("toolBtnCurrent");
		$("#toolHand").addClass("toolBtnCurrent");
		
		return false;
		
	});
	
	$(document).bind('keyup','space',function (evt){		//当空格键释放时
		if( CSWT.currentToolBtn == "toolHand" ){
			return false;
		}
		CSWT.spaceKeyDown = false;
		
		adjustDaggleMask().hide();
		
		maskDaggle.removeClass("openhand");
		$(".toolBtnCurrent").removeClass("toolBtnCurrent");
		$("#"+CSWT.currentToolBtn).addClass("toolBtnCurrent");
		return false;
	});

	workbench.mousedown(function(e){
		if(CSWT.currentToolBtn == "toolHand"){
			adjustDaggleMask().show().addClass("closedhand");
			$("#maskSprites").hide();
		}
	});
	
	workbench.mouseover(function(){
		if(CSWT.currentToolBtn == "toolHand"){
			workbench.addClass("openhand");
		}
		else{
			workbench.removeClass("openhand");
		}
	});
	
	var maskIcons = $("#maskIcons")
	maskIcons.mouseover(function(){	/**图标遮罩*/
		if( CSWT.currentToolBtn != "toolHand" && !CSWT.spaceKeyDown ){
			maskIcons.addClass("crosshair");
		}
		else{
			maskIcons.removeClass("crosshair");
		}
		
	});
	
	maskDaggle.mouseover(function(){
		if( CSWT.currentToolBtn == "toolHand" || CSWT.spaceKeyDown ){
			maskDaggle.addClass("openhand");
		}
		else{
			maskDaggle.removeClass("openhand");
		}
	});
	
	maskDaggle.mousedown(function(e){
		
		if(e.which == 1){ // 1 == left; 2 == middle; 3 == right
			if(CSWT.spaceKeyDown || CSWT.currentToolBtn == "toolHand"){
			
				CSWT.mouseX = e.clientX;
				CSWT.mouseY = e.clientY;
				
				maskDaggle.removeClass("openhand");
				maskDaggle.addClass("closedhand");
				
				CSWT.mouseDown = true;
			}
		}
	});

	maskDaggle.mouseup(function(){
	
		maskDaggle.addClass("openhand");
		maskDaggle.removeClass("closedhand");
		
		CSWT.mouseDown = false;
		
		if( CSWT.currentToolBtn == "toolHand" && CSWT.mouseDown ){
			adjustDaggleMask().show().addClass("openhand");
		}
		else if(!CSWT.spaceKeyDown){
			adjustDaggleMask().hide().removeClass("openhand");
		}
		
		if(!CSWT.spaceKeyDown && CSWT.currentToolBtn != "toolHand" ){
			maskDaggle.removeClass("openhand");
		}
		
	});

	maskDaggle.mousemove(function(e){
		
		if( ( CSWT.spaceKeyDown || CSWT.currentToolBtn == "toolHand" ) && CSWT.mouseDown ){

			var _eSL = workbench.scrollLeft();
			var _eST = workbench.scrollTop();
			
			var _neSL = _eSL-(e.clientX-CSWT.mouseX);
			var _neST = _eST-(e.clientY-CSWT.mouseY);
			
			workbench.scrollLeft(_neSL);
			workbench.scrollTop(_neST);
			
			CSWT.mouseX = e.clientX;
			CSWT.mouseY = e.clientY;
			
		}
		
	});

}

/**
 ****************
 * 弹出框
 ****************
 */
function dialog(){
	
	$(".cswtDialog").draggable({ handle: 'div.dialogHeader' });
	
	$(".cswtDialog a.close, .cswtDialog a.cancel").click(function(){
		hideDialog();
	});
	
	$("#toolImage").click(function(){
		var dialogImage = $("#dialogImage");
		showDialog(dialogImage);
		
		$("#dialogImage .enter").click(function(){
			var imgStr = $("#imageFile").val();
			
			var path = "file:///"+imgStr.slice(0,1)+"|/"+imgStr.slice(3).replace(/\\/g,"/");
			
			$("#bottomTip").html(path);
			
//			D:\CSS Sprites Web Tools\upload\ico.gif

//			<img src="file:///D|/CSS Sprites Web Tools\upload\ico.gif" width="2400" height="180" />
//			
//			<img src="upload/ico.gif" width="2400" height="180" />

			$("#icons").html('<img src="'+path+'" />');
//			alert($("#icons img").width());
			$("#icons").width($("#icons img").width());
			$("#icons").height($("#icons img").height());
			hideDialog();
		});
		
	});
	
	$("#toolCssCode").click(function(){
		var dialogCSSCode = $("#dialogCSSCode");
		showDialog(dialogCSSCode);
		
		var p = $("#dialogCSSCode .dialogBody p");
		
		var sLength = CSWT.SpriteList.length;
		
		if(sLength){
			var names = "";
			var styles = "";
			
			for(var i=0; i<CSWT.SpriteList.length; i++){
				var sprite = CSWT.SpriteList[i];
				if(i==CSWT.SpriteList.length-1){
					names += sprite.name;
				}
				else{
					names += sprite.name+", ";
				}
				styles += sprite.name+"{ width:"+sprite.width+"px; height:"+sprite.height+"px; background-position:"+sprite.backgroundPosition.x+"px "+sprite.backgroundPosition.y+"px;}<br />";
			}
			p.html(names+"<br />{ background-image:url(upload/ico.gif); }<br />"+styles);
		}
		else{
			p.html("No sprites!");
		}
		
	});
	
	$("#toolHelp").click(function(){
		var dialogHelp = $("#dialogHelp");
		showDialog(dialogHelp);
	});
}

/**
 ****************
 * 显示弹出框
 ****************
 */
function showDialog(dialog){
	$("#mask").show();
	dialog.show();
	adjustDialog();
}

/**
 ****************
 * 隐藏弹出框
 ****************
 */
function hideDialog(){
	$("#mask").hide();
	$(".cswtDialog").hide();
}

/**
 ****************
 * 调整弹出框位置
 ****************
 */
function adjustDialog(){
	var _window = $(window);	//浏览器窗口对象
	var windowWidth = _window.width();	//浏览器窗口宽度
	var windowHeight = _window.height();//浏览器窗口高度
	
	var dialog = $(".cswtDialog:visible");
	
	dialog.css({left:(windowWidth/2-dialog.width()/2), top:windowHeight/4});
}

/**
 ****************
 * 用键盘方向键控制一个Sprite在画面上移动
 ****************
 */
function moveSprite(direction){
	if(!CSWT.currentSprite){	//当前没有选中编辑的Sprite对象时
		return;
	}
	
	var left = CSWT.currentSprite.$sprite.css("left").slice(0,-2)-0;
	var top  = CSWT.currentSprite.$sprite.css("top").slice(0,-2)-0;
	
	switch (direction){
		case "left":
			CSWT.currentSprite.$sprite.css({"left":left-CSWT.defaultMoveDirection});
		break
		
		case "right":
			CSWT.currentSprite.$sprite.css({"left":left+CSWT.defaultMoveDirection});
		break
		
		case "up":
			CSWT.currentSprite.$sprite.css({"top":top-CSWT.defaultMoveDirection});
		break
		
		case "down":
			CSWT.currentSprite.$sprite.css({"top":top+CSWT.defaultMoveDirection});
		break
		
//		default:
//			alert("null");
	}
	CSWT.updateSprite(CSWT.currentSprite.$sprite);
}

/**
 ****************
 * 用Ctrl/Alt+键盘方向键微调一个Sprite的尺寸
 ****************
 */
function fineTuning(typeKey,direction){
	if(!CSWT.currentSprite){	//当前没有选中编辑的Sprite对象时
		return;
	}
	
	var cs = CSWT.currentSprite;
	var left = cs.$sprite.css("left").slice(0,-2)-0;
	var top  = cs.$sprite.css("top").slice(0,-2)-0;
	var width= cs.width;
	var height = cs.height;
	
	if(width-5<0){
		CSWT.currentSprite.$sprite.css({"width":width+1});
		CSWT.updateSprite(CSWT.currentSprite.$sprite);
		return;
	}
	if(height-5<0){
		CSWT.currentSprite.$sprite.css({"height":height+1});
		CSWT.updateSprite(CSWT.currentSprite.$sprite);
		return;
	}
	
	switch (direction){
		case "left":
			typeKey == "Alt" 
			? CSWT.currentSprite.$sprite.css({"width":width+CSWT.defaultFineTuning, "left":left-CSWT.defaultFineTuning})
			: CSWT.currentSprite.$sprite.css({"width":width-CSWT.defaultFineTuning})
		break
		
		case "right":
			typeKey == "Alt" 
			? CSWT.currentSprite.$sprite.css({"width":width-CSWT.defaultFineTuning, "left":left+CSWT.defaultFineTuning })
			: CSWT.currentSprite.$sprite.css({"width":width+CSWT.defaultFineTuning})
		break
		
		case "up":
			typeKey == "Alt"
			? CSWT.currentSprite.$sprite.css({"height":height+CSWT.defaultMoveDirection, "top":top-CSWT.defaultMoveDirection})
			: CSWT.currentSprite.$sprite.css({"height":height-CSWT.defaultMoveDirection})
		break
		
		case "down":
			typeKey == "Alt"
			? CSWT.currentSprite.$sprite.css({"height":height-CSWT.defaultMoveDirection, "top":top+CSWT.defaultMoveDirection})
			: CSWT.currentSprite.$sprite.css({"height":height+CSWT.defaultMoveDirection})
		break

	}
	CSWT.updateSprite(CSWT.currentSprite.$sprite);
}

/**
 ****************
 * 快捷键
 ****************
 */
function shortcuts(){
	/** esc */
	jQuery(document).bind('keydown', 'esc',function (evt){
		hideDialog();
		return false;
	});
	
	/** tab */
	jQuery(document).bind('keydown', 'tab',function (evt){jQuery('#_tab').addClass('dirty'); return false; });
	
	/** backspace退格键 */
	jQuery(document).bind('keydown', 'backspace',function (evt){ CSWT.deleteSprite(CSWT.currentSprite); return false; });

	/** delete键 */
	jQuery(document).bind('keydown', 'del',function (evt){ CSWT.deleteSprite(CSWT.currentSprite); return false; });
	
	/** 方向键 */
	jQuery(document).bind('keydown', 'left',	function (evt){	moveSprite("left"); 	return false; });
	jQuery(document).bind('keydown', 'up',		function (evt){	moveSprite("up"); 		return false; });
	jQuery(document).bind('keydown', 'right',	function (evt){	moveSprite("right"); 	return false; });
	jQuery(document).bind('keydown', 'down',	function (evt){	moveSprite("down"); 	return false; });
	
	/** Ctrl + 方向键 */
	jQuery(document).bind('keydown', 'Ctrl+left', function (evt){	fineTuning("Ctrl","left");  return false; });
	jQuery(document).bind('keydown', 'Ctrl+up',   function (evt){	fineTuning("Ctrl","up"); 	 return false; });
	jQuery(document).bind('keydown', 'Ctrl+right',function (evt){	fineTuning("Ctrl","right"); return false; });
	jQuery(document).bind('keydown', 'Ctrl+down', function (evt){	fineTuning("Ctrl","down");  return false; });

	/** Alt + 方向键 */
	jQuery(document).bind('keydown', 'Alt+left', 	function (evt){	fineTuning("Alt","left"); 	return false; });
	jQuery(document).bind('keydown', 'Alt+up', 		function (evt){	fineTuning("Alt","up"); 		return false; });
	jQuery(document).bind('keydown', 'Alt+right', function (evt){	fineTuning("Alt","right"); 	return false; });
	jQuery(document).bind('keydown', 'Alt+down', 	function (evt){	fineTuning("Alt","down"); 	return false; });
	
	/** Shift + 方向键 */
	jQuery(document).bind('keydown', 'Shift+left', function (evt){jQuery('#_Shift_left').addClass('dirty'); return false; });
	jQuery(document).bind('keydown', 'Shift+up', function (evt){jQuery('#_Shift_up').addClass('dirty'); return false; });
	jQuery(document).bind('keydown', 'Shift+right', function (evt){jQuery('#_Shift_right').addClass('dirty'); return false; });
	jQuery(document).bind('keydown', 'Shift+down', function (evt){jQuery('#_Shift_down').addClass('dirty'); return false; });
	
}


/**
 * **************
 * jQuery-Plugin "Opacity"
 * Simple Example $(".bgtabb").fixOpacity(75); <=> style="filter:alpha(opacity=75); opacity:0.75;"
 * **************
 */
(function($) {
	jQuery.fn.Opacity = function(value) {
		$(this).css({ filter: "alpha(opacity="+value+")", opacity: value!=0?value/100:0 });
		return $(this);
	};
})(jQuery);

