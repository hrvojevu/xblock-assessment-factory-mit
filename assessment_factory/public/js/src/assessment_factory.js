/* Javascript for AssessmentFactoryXBlock. */
function AssessmentFactoryBlock(runtime, element, ctx) {

    $(document).on('click', '.reset', function(){
        $.ajax({
            type: 'POST',
            url: runtime.handlerUrl(element, 'reset'),
            data: JSON.stringify(""),
            success: function(ctx){
                renderElements(ctx);
            }
        });
    });

    $(document).on('click', '.next-step', function(){
        if($(this).hasClass("begin")){
            submitItems(runtime.handlerUrl(element, 'next_step'), true);
        }
    });

    $(document).on('click', '.previous-step', function(){
        $.ajax({
            type: 'POST',
            url: runtime.handlerUrl(element, 'previous_step'),
            data: JSON.stringify(""),
            success: function(ctx){
                renderElements(ctx);
            }
        });
    });

    function submitItems(url, next_step){
        var data = [];
        $('.zone-container .item').each(function () {
            var item = {};
            item.item_id = $(this).attr("id");
            item.category_id = $(this).parents(".category").attr("id");
            item.zone_id = $(this).parent().attr("id");
            data.push(item);
        });

        $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(data),
            success: function(ctx){
                if(next_step){
                    renderElements(ctx);
                } 
            }
        });
    }

    function initDraggable(){
        $(".item").draggable({
            containment: $('.assessment-factory-block'),
            snap: '.assessment-factory-block',
            revert: 'invalid',
            revertDuration: 200,
            helper:"clone"               
        });
    };

    $(document).on('DOMSubtreeModified', '.items-container', function(){
        if($(".items-container").is(':empty')){
            $(".submit-step").removeClass("disabled");
        }
    });

    function initDroppable(){
        $(".categories-container .zone").droppable({
            tolerance: 'touch',
            drop: function( event, ui ) {
                ui.draggable.detach().appendTo($(this));                
            }
        });
    };

    function renderElements(ctx){
        if(ctx.current_step == 0){
            renderFirstStep(ctx.display_name);
        }
        else if(ctx.current_step % 2 == 1){
            $(".main-container").empty();
            var category = ctx.studio_assignment.categories[parseInt(ctx.current_step/2)];
            var items = getItemsForCategory(ctx.studio_assignment.items, category);

            renderHeader(category, ctx.display_name);
            
            renderCategory(category, ctx.display_name); 
            renderItems(items, ctx.item_state); 
            renderStepButtons();
            
            $(".next-step").addClass("disabled");
            if(!$(".items-container").is(':empty')){
                $(".submit-step").addClass("disabled");
            }

            $('.submit-step').click(function(){
                if($(".items-container").is(':empty')){
                    submitItems(runtime.handlerUrl(element, 'next_step'), true);
                }  
            });

            initDraggable();
            initDroppable();
        }
        else if(ctx.current_step % 2 == 0){
            $(".main-container").empty();
            var category = ctx.studio_assignment.categories[parseInt((ctx.current_step/2))-1];
            var items = getItemsForCategory(ctx.studio_assignment.items, category);

            renderHeader(category, ctx.display_name);
            renderCategory(category, ctx.display_name); 
            renderItems(items, ctx.item_state); 
            renderStepButtons();

            $(".submit-step").addClass("disabled");

            var items = checkCorrectIncorrectItems(category['id']);
            markCorrectIncorrectItems(items);
            var last_category = ctx.studio_assignment.categories[ctx.studio_assignment.categories.length -1];
            renderCompletionText(items, ctx.studio_assignment.categories.length * 2, ctx.current_step, last_category['name']);

            $('.next-step').click(function(){
                if(ctx.current_step == 4){
                    parent.postMessage(JSON.stringify({action:'continue'}),'*');
                }
                else{
                    submitItems(runtime.handlerUrl(element, 'next_step'), true);
                }
            });
        }
        renderStepsProgress(ctx.current_step, ctx.studio_assignment.categories.length * 2);

        $(".item-text").css({
            'width': $(".items-container").width() - 20
        });
    };

    function checkCorrectIncorrectItems(category_id){
        var items = {};
        $.ajax({
            async: false,
            type: 'POST',
            url: runtime.handlerUrl(element, 'check_problem'),
            data: JSON.stringify({category_id: category_id}),
            success: function(data){
                items.correct = data.correct_items;
                items.incorrect = data.incorrect_items;
            }
        });
        return items;
    };


    $(function ($) {
        renderElements(ctx);

        $(window).on('resize', function(){
            $(".item-text").css({
                'width': $(".items-container").width() - 10
            });
        });
    });
}

function markCorrectIncorrectItems(items){
    for(var key in items.incorrect){
        $(s.sprintf('#%(item_id)s', {item_id: items.incorrect[key]})).addClass("incorrect-item");
    }
    for(var key in items.correct){
        $(s.sprintf('#%(item_id)s', {item_id: items.correct[key]})).addClass("correct-item");
    }
};

function getItemsForCategory(all_items, category){
    var items = [];
    for (var key in all_items) {
        if (all_items.hasOwnProperty(key) && all_items[key]['category_id'] == category['id']){
            items.push(all_items[key]);
        }
    }
    return items;
}

function renderHeader(category, display_name){
    var $main_container = $(".main-container");
    var $heading_container = $("<div class='heading-container'></div>");
    $main_container.append($heading_container);

    var $display_name = $('<p class="display-name left">' + display_name + ': ' + category['name'] + '</p>');
    var $category_text = $("<p class='category-text'>" + category['text'] + "</p>");

    $heading_container.append($display_name);
    $heading_container.append($category_text);
}

function renderStepButtons(){
    var $main_container = $(".main-container");
    var $steps_container = $("<div class='steps-container'></div>");
    $main_container.append($steps_container);

    var $next_step = $("<p class='btn next-step'>Continue</p>");
    var $submit = $("<p class='btn submit-step'>Submit</p>");
    var $previous_step = $("<p class='btn previous-step'>Back</p>");
    $steps_container.append($previous_step);
    $steps_container.append($next_step);
    $steps_container.append($submit);
}

function renderItems(items, item_state){
    var $main_container = $(".main-container");
    var $items_container = $("<div class='items-container'></div>");
    $main_container.append($items_container);

    for (var key in items) {
        if (items.hasOwnProperty(key)) {
            if(items[key]['id'] in item_state){
                var item_id = items[key]['id'];
                var zone_id = item_state[item_id]['zone_id'];

                var $container = $("#" + zone_id);
                var $element = $("<p id='" + items[key]['id'] + "'></p>").addClass("item item-text").text(items[key]['value']).attr("style", item_state[item_id]['style']);
                $container.append($element);                
            }
            else{
                if(items[key]['type'] ==  "text"){
                    var $element = $("<p id='" + items[key]['id'] + "'></p>").addClass("item item-text").text(items[key]['value']);
                    $items_container.append($element);   
                }  
                else if(items[key]['type'] == "image"){
                    var $element = $("<div id='" + items[key]['id'] + "'></div>").addClass("item item-image").css({
                        "background-image": "url('" + items[key]['value'] + "')"
                    });
                    $items_container.append($element); 
                }
            }
        }           
    }
}

function renderCategory(category, display_name){
    var $main_container = $(".main-container");
    var $categories_container = $("<div class='categories-container'></div>");
    $main_container.append($categories_container);

    if(category['type'] ==  "text"){
        var value = category['value'];

        for(var i in category['zones']){
            var zone = category['zones'][i];
            value = value.replace("$$"+zone['id']+"$$","<span id='" + zone['id'] + "' class='zone'></span>");
        }
        var $element = $("<p id='" + category['id'] + "'></p>").addClass("category category-text").html(value);
    }
    else if(category['type'] == "image"){
        var $element = $("<div id='" + category['id'] + "'></div>").addClass("category category-image").css({
            'background-image': 'url(' + categories[key]['value']  + ')'
        });

        for(var i in category['zones']){
            var zone = category['zones'][i];
            var $zone_element = $("<div id='" + zone['id'] + "' style='" + zone['style'] + "'></div>").addClass("zone image-zone");
            $element.append($zone_element);
        }
    }
    else if(category['type'] == "blank"){
        var $element = $("<div id='" + category['id'] + "'></div>").addClass("category category-blank");

        for(var i in category['zones']){
            var zone = category['zones'][i];
            var $zone_element = $("<div id='" + zone['id'] + "'></div>").addClass("zone blank-zone");
            var $zone_name = $("<p class='zone-name'>" + zone['name'] + "</p>");
            var $zone_container = $("<div class='zone-container'></div>");
            $zone_container.append($zone_name);
            $zone_container.append($zone_element);
            $element.append($zone_container);
        }
    }
    $categories_container.append($element);            
}

function renderFirstStep(display_name){
    var $container = $('<div class="heading-container begining"></div>');
    var $activity = $("<p class='activity'>Activity</p>")
    var $display_name = $('<p class="display-name">' + display_name + '</p>');
    var $continue_btn = $("<button class='btn next-step begin'>Begin</button>");
    $(".main-container").empty();
    $(".main-container").append($container);
    $container.append($activity);
    $container.append($display_name);
    $container.append($continue_btn);
}

function renderCompletionText(items, max_step, current_step, category_name){
    var correct = items.correct.length;
    var incorrect = items.incorrect.length;
    var total = correct + incorrect;
    if(current_step == max_step){
        $(".category-text").html("<span>You got " + correct + " out of " + total + " correct.</span> Click BACK to try again, or click CONTINUE to end the activity");
    }
    else{
        $(".category-text").html("<span>You got " + correct + " out of " + total + " correct.</span> Click BACK to try again, or click CONTINUE for " + category_name);
    }
}

function renderStepsProgress(current_step, max_step){
    var $container = $(".steps-progress-container");
    $container.empty();
    $(".step").removeClass("highlight-step");
    for(var i=0; i<=max_step; i++){
        var $step = $("<div class='step'></div>");
        $step.css({
            "width": "calc((100% / "+ (max_step+1) +") - 4px)"
        });
        $container.append($step);

        if(i<=current_step){
            $step.addClass("highlight-step");
        }
    }
}