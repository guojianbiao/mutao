(function($){
	'use strict';

	function Tab($elem,options){
		this.$elem = $elem;
		this.options = options;

		this.$items = this.$elem.find('.tab-item');
		this.$panels = this.$elem.find('.tab-panel');
		this.$container = this.$elem.find('.container');
		this.itemNum = this.$items.length;
		this.curIndex = this._getCorrectIndex(this.options.activeIndex);

		this._init();
	}

	Tab.DEFAULTS = {
		event:'mouseenter', // click
		css3:false,
		js:false,
		animation:'fade',
		activeIndex:0,
		interval:1000,
		delay:0
	};
	// 初始化
	Tab.prototype._init = function(){
		var self = this,
			timer = null;
		
		// init show 初始化显示  刚开始将所有的东西初始化
		// 把不需要的class先移除，再给指定的元素添加class
		this.$items.removeClass('tab-item-active');
		this.$items.eq(this.curIndex).addClass('tab-item-active');
		this.$panels.eq(this.curIndex).show();
		this.$elem.trigger('tab-show',[this.curIndex,this.$panels[this.curIndex]]);

		//   trigger event   因为showHide会发送一些show hide shown 	  hidden事件，this.$panels监听这些事件后，改成自己的事件发送出去
		this.$panels.on('show shown hide hidden',function(e){
			self.$elem.trigger('tab-' + e.type,[self.$panels.index(this),this]);
		})

		// 显示隐藏初始化
		this.$panels.showHide(this.options);

		// bind event 绑定事件
		this.options.event = this.options.event === 'click' ? 'click' : 'mouseenter';
		this.$elem.on(this.options.event,'.tab-item',function(){
			var elem = this;
			if(self.options.delay){ // delay
				clearTimeout(timer); // 当从第二个快速移动到第三个，停留时间短，第三个会清除第二个的定时器 再重新开一个
				timer = setTimeout(function(){
					// 触发这个事件就开始切换  所以要知道其索引值
					self.toggle(self.$items.index(elem));
				},self.options.delay);
			}else{
				self.toggle(self.$items.index(elem));
			}
		})

		// auto
		if(this.options.interval && !isNaN(Number(this.options.interval))){
			this.$container.hover($.proxy(this.pause,this),$.proxy(this.auto,this));
			this.auto();
		}
	};
	// 获取正确的索引
	Tab.prototype._getCorrectIndex = function(index){
		if(isNaN(Number(index))) return 0;
		if(index < 0 ) return this.itemNum - 1;
		if(index > this.itemNum - 1 ) return 0;
		return index;
	}
	// 切换 让this.$panels显示隐藏
	Tab.prototype.toggle = function(index){
		if(this.curIndex === index) return;

		this.$panels.eq(this.curIndex).showHide('hide');
		this.$panels.eq(index).showHide('show');

		this.$items.eq(this.curIndex).removeClass('tab-item-active');
		this.$items.eq(index).addClass('tab-item-active');

		// 记得更新一下当前的索引为指定的索引
		this.curIndex = index;
	}
	//自动显示隐藏
	Tab.prototype.auto = function(){
		var self = this;
		this.intervalId = setInterval(function(){
			self.toggle(self._getCorrectIndex(self.curIndex+1));
		},this.options.interval);
	}
	// 停止
	Tab.prototype.pause = function(){
		clearInterval(this.intervalId);
	}





	$.fn.extend({
		tab:function(option){
			return this.each(function(){
				var $this = $(this),
					tab = $this.data('tab'),
					options = $.extend({}, Tab.DEFAULTS,$this.data(),typeof option === 'object' && option);
					if(!tab){
						$this.data('tab',tab = new Tab($this,options));
					}
					if(typeof tab[option] === 'function'){
						tab[option]();
					}
			})
		}
	});
	

})(jQuery);
