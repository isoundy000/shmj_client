cc.Class({
    extends: cc.Component,

    properties: {

    },

    addClickEvent:function(node, target, component, handler, data) {
        console.log(component + ":" + handler);
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        eventHandler.customEventData = data;

        var clickEvents = node.getComponent(cc.Button).clickEvents;
        clickEvents.push(eventHandler);
    },
    
    addSlideEvent:function(node,target,component,handler) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;

        var slideEvents = node.getComponent(cc.Slider).slideEvents;
        slideEvents.push(eventHandler);
    },

	showDialog: function(dialog, path, enable, parent) {
		dialog.active = enable;
		return; // TODO

		var body = cc.find(path, dialog);

		if (enable) {
			body.scaleX = 0.7;
			body.scaleY = 0.7;
			body.opacity = 120;
			dialog.active = true;

			var action = cc.sequence(cc.spawn(cc.scaleTo(0.2, 1.1), cc.fadeTo(0.2, 200)),
									cc.spawn(cc.scaleTo(0.1, 1.0), cc.fadeTo(0.1, 255)));

			body.runAction(action);
		} else {
			var data = {
				dialog: dialog,
				parent: parent,
			};

			var finished = cc.callFunc(function(target, node) {
				node.dialog.active = false;

				if (node.parent) {
					node.parent.active = false;
				}
			}, this, data);

			var action = cc.sequence(cc.spawn(cc.scaleTo(0.1, 0.7), cc.fadeTo(0.1, 120)),
									finished);

			body.runAction(action);
		}
    },

    showFrame: function(frame, headPath, bodyPath, enable, parent) {
		frame.active = enable;
		return; // TODO

		var head = cc.find(headPath, frame);
		var body = cc.find(bodyPath, frame);

		if (enable) {
			head.opacity = 0;
			body.opacity = 0;
			frame.active = true;

			var nodes = {
				head: head,
				body: body,
			};

			var showHead = cc.callFunc(function(target, data) {
				data.head.opacity = 255;
			}, this, nodes);

			var showBody = cc.callFunc(function(target, data) {
				data.body.opacity = 255;
			}, this, nodes);

			var actionHead = cc.sequence(cc.hide(),
										cc.place(head.x, head.y + head.height),
										cc.show(),
										showHead,
										cc.moveBy(0.3, 0, 0 - head.height));
			head.runAction(actionHead);

			var actionBody = cc.sequence(cc.hide(),
										cc.place(body.x, body.y - body.height),
										cc.show(),
										showBody,
										cc.moveBy(0.3, 0, body.height));
			body.runAction(actionBody);
		} else {
			var data = {
				headX: head.x,
				headY: head.y,
				bodyX: body.x,
				bodyY: body.y,
				head: head,
				body: body,
				node: frame,
				parent: parent,
			};

			var finished = cc.callFunc(function(target, data) {
				data.node.active = false;

				data.head.y = data.headY;
				data.body.y = data.bodyY;
				
				if (data.parent) {
					data.parent.active = false;
				}
			}, this, data);

			var actionHead = cc.moveBy(0.3, 0, head.height);
			head.runAction(actionHead);

			var actionBody = cc.sequence(cc.moveBy(0.31, 0, 0 - body.height), finished);
			body.runAction(actionBody);
		}
    },

	getItemDesc: function(name, amount) {
		var names = [ 'gold', 'gem', 'lottery', 'active', 'recharge' ];
		var descs = [ '金币', '钻石', '奖券', '活跃值', '充值卡'];
		//var units = [  '个', '颗', '', '点', '元' ];
		var desc = null;
		var id = names.indexOf(name);

		if (id >= 0) {
			if (amount != null)
                desc = amount + descs[id];
            else
                desc = descs[id];
		}

		return desc;
    },

    dateFormat: function(time) {
        var date = new Date(time);
        var datetime = "{0}-{1}-{2} {3}:{4}:{5}";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = month >= 10? month : ("0"+month);
        var day = date.getDate();
        day = day >= 10? day : ("0"+day);
        var h = date.getHours();
        h = h >= 10? h : ("0"+h);
        var m = date.getMinutes();
        m = m >= 10? m : ("0"+m);
        var s = date.getSeconds();
        s = s >= 10? s : ("0"+s);
        datetime = datetime.format(year,month,day,h,m,s);
        return datetime;
    },

    loadImage : function(url, node, force) {
        let sprite = node.getComponent(cc.Sprite);
        if (!url || url.length == 0) {
            sprite.spriteFrame = null;
            return;
        }

        var type = url.slice(-3);
        if (type != 'jpg' && type != 'png')
            type = 'jpg';

        console.log('loadImage: ' + url + ' type:' + type);

        if (force) {
            cc.loader.release(url);
            sprite.spriteFrame = null;
            console.log('release spriteFrame');
        }

        //cc.textureCache.addImageAsync(url, tex=>{
        cc.loader.load({ url : url, type : type }, (err, tex)=>{
            if (err) {
                console.log(err);
                return;
            }

            sprite.spriteFrame = new cc.SpriteFrame(tex, cc.Rect(0, 0, tex.width, tex.height), false, 0);
        });
    },
    
    queryParse: function(query) {
        if (query == null || query.length == 0)
            return {};

        let params = {};
        let arr = query.split('&');

        arr.forEach(x=>{
            let num = x.indexOf('=');
            if (num > 0)
                params[x.substring(0, num)] = x.substr(num + 1);
        });

        return params;
    }
});

