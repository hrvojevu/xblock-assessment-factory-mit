/* Javascript for AssessmentFactoryXBlock. */
function AssessmentFactoryBlock(runtime, element, ctx) {

    $(document).on('click', '.reset', function(){
        $.ajax({
            type: 'POST',
            url: runtime.handlerUrl(element, 'reset'),
            data: JSON.stringify(""),
            success: function(data){
                $(".item").remove();  
                $(".category").remove();

                renderElements(data);
                initDraggable();
                initDroppable();   
                if($(".check").length){
                    $(".check").text(s.sprintf('Check (%(retry_count)s left)', data)); 
                }
                else{
                    $(".other-container").append('<i class="check">Check (3 left)</i>');
                    $(".other-container").append('<i class="submit">Submit</i>');
                }
                
            }
        });
    });

    $(document).on('click', '.check', function(){
        $.ajax({
            type: 'POST',
            url: runtime.handlerUrl(element, 'check_problem'),
            data: JSON.stringify(""),
            success: function(data){
                for(var key in data.incorrect_items){
                    $(s.sprintf('#%(item_id)s', {item_id: data.incorrect_items[key]})).addClass("incorrect-item");
                }
                for(var key in data.correct_items){
                    $(s.sprintf('#%(item_id)s', {item_id: data.correct_items[key]})).addClass("correct-item");
                }
                $(".check").text(s.sprintf('Check (%(retry_count)s left)', data));

                setTimeout(function(){
                    $(".item").removeClass("incorrect-item correct-item");
                }, 5000);
            }
        });     
    });

    $(document).on('click', '.submit', function(){
        $.ajax({
            type: 'POST',
            url: runtime.handlerUrl(element, 'submit_problem'),
            data: JSON.stringify(""),
            success: function(data){
               $(".check").remove();
               $(".submit").remove();
            }
        });
    });

    function submitItem(item_id, category_id, zone_id){
        var $element = $(s.sprintf('#%s', item_id));
        var data = {
            item_id: item_id,
            category_id: category_id,
            zone_id: zone_id,
            style: $element.attr("style")
        };

        $.ajax({
            type: 'POST',
            url: runtime.handlerUrl(element, 'submit_item'),
            data: JSON.stringify(data),
            success: function(data){
            }
        });
    }

    function initDraggable(){
        $(".items-container .item").draggable({
            containment: $('.assessment-factory-block'),
            snap: '.assessment-factory-block',
            revert: 'invalid',
            revertDuration: 200,
            start: function( event, ui ) {
                publishEvent({
                    event_type: 'edx.assessment_factory.item.picked_up',
                    item_id: event.target.id,
                });
            }                
        });
    }

    function initDroppable(){
        $(".categories-container .zone").droppable({
            tolerance: 'fit',
            drop: function( event, ui ) {
                var item_id = ui.draggable[0].id;
                submitItem(item_id, $(event.target).parent().attr('id'), event.target.id);
            }
        });
    }

    function publishEvent(data) {
        $.ajax({
            type: 'POST',
            url: runtime.handlerUrl(element, 'publish_event'),
            data: JSON.stringify(data)
        });
    };

    $(function ($) {
        renderElements(ctx);
        initDraggable();
        initDroppable(); 
    });
}

function renderElements(ctx){
    var $items_container = $(".items-container");
    var $categories_container = $(".categories-container");

    for (var key in ctx.studio_assignment.items) {
        if (ctx.studio_assignment.items.hasOwnProperty(key)) {
            if(ctx.studio_assignment.items[key]['type'] ==  "text"){
                var $element = $("<p id='" + ctx.studio_assignment.items[key]['id'] + "'></p>").addClass("item item-text").text(ctx.studio_assignment.items[key]['value']);
                $items_container.append($element);   
            }  
            else if(ctx.studio_assignment.items[key]['type'] == "image"){
                var $element = $("<div id='" + ctx.studio_assignment.items[key]['id'] + "'></div>").addClass("item item-image").css({
                    "background-image": "url('" + ctx.studio_assignment.items[key]['value'] + "')"
                });
                $items_container.append($element); 
            }

            if(ctx.studio_assignment.items[key]['id'] in ctx.item_state){
                var item_id = ctx.studio_assignment.items[key]['id'];
                $("#" + item_id).attr("style", ctx.item_state[item_id]['style']);
            }
        }           
    }

    for (var key in ctx.studio_assignment.categories) {
        if (ctx.studio_assignment.categories.hasOwnProperty(key)) {
            if(ctx.studio_assignment.categories[key]['type'] ==  "text"){
                var value = ctx.studio_assignment.categories[key]['value'];

                for(var i in ctx.studio_assignment.categories[key]['zones']){
                    var zone = ctx.studio_assignment.categories[key]['zones'][i];
                    value = value.replace("$$"+zone['id']+"$$","<span id='" + zone['id'] + "' class='zone'></span>");
                }
                var $element = $("<p id='" + ctx.studio_assignment.categories[key]['id'] + "'></p>").addClass("category category-text").html(value);
            }
            else if(ctx.studio_assignment.categories[key]['type'] == "image"){
                var $element = $("<div id='" + ctx.studio_assignment.categories[key]['id'] + "'></div>").addClass("category category-image").css({
                    'background-image': 'url(' + ctx.studio_assignment.categories[key]['value']  + ')'
                });

                for(var i in ctx.studio_assignment.categories[key]['zones']){
                    var zone = ctx.studio_assignment.categories[key]['zones'][i];
                    var $zone_element = $("<div id='" + zone['id'] + "' style='" + zone['style'] + "'></div>").addClass("zone image-zone");
                    $element.append($zone_element);
                }
            }
            else if(ctx.studio_assignment.categories[key]['type'] == "blank"){
                var $element = $("<div id='" + ctx.studio_assignment.categories[key]['id'] + "'></div>").addClass("category category-blank");

                for(var i in ctx.studio_assignment.categories[key]['zones']){
                    var zone = ctx.studio_assignment.categories[key]['zones'][i];
                    var $zone_element = $("<div id='" + zone['id'] + "' style='width:" + zone['width'] + "px;height:" + zone['height'] + "px'></div>").addClass("zone image-zone");
                    $element.append($zone_element);
                }
            }
            $categories_container.append($element); 
        }           
    }
}