function AssessmentFactoryEditBlock(runtime, element, params) {

    /* Initialize jQuery-UI tabs */
    $( function() {
        $("#assessment-factory-tab-container").tabs();
    } );

    $(element).on('click', '.add-item', function() {
        var $el = ('<div class="item-category-content item">' +
                        '<div class="general-container">' + 
                            '<p>Item ID</p>' +
                            '<input class="value-input" type="text" placeholder="ID">' +
                            '<p>Item Type</p>' +
                            '<select class="item-type-select">' +
                                '<option selected="selected" value="text">Text</option>' +
                                '<option value="image">Image</option>' +
                            '</select>' +
                       '</div>' +
                        '<div class="value-container item-value">' +
                            '<p>Item Value</p>' +
                            '<input class="value-input" type="text" placeholder="Value">' +
                            '<p>Category ID</p>' +
                            '<input class="category-id" type="text" placeholder="Category ID">' +
                            '<p>Zone ID</p>' +
                            '<input class="zone-id" type="text" placeholder="Zone ID">' +
                        '</div>' +
                        '<div style="clear:both"></div>' + 
                    '</div>');        
        $(this).before($el);
        removeButton();
        selectOnChange();
    });

    $(element).on('click', '.add-category', function() {
        var $el = ('<div class="item-category-content category">' + 
                        '<div class="general-container">' +
                            '<p>Category ID</p>' +
                            '<input class="value-input" type="text" value="" placeholder="ID">' +
                            '<p>Category Name</p>' +
                            '<input class="category-name" type="text" value="" placeholder="Name">' +
                            '<p>Category Type</p>' +
                            '<select class="category-type-select">' +
                                '<option selected="selected" value="text">Text</option>' +
                                '<option value="image">Image</option>' +
                                '<option value="blank">Blank zone</option>-' +
                            '</select>' +
                        '</div>' +
                        '<div class="value-container category-value">' +  
                            '<p>Category Value</p>' +                      
                            '<textarea class="value-input" rows="4" placeholder="Value"></textarea>' +
                        '</div>' +
                        '<div style="clear:both"></div>' + 
                    '</div>');        
        $(this).before($el);
        removeButton();
        selectOnChange();
    });

    /*Function for submiting input elements in edit mode*/
    $(element).on('click', '.save-button', function() {
        var validation = validateSubmit();
        if(validation.is_valid){
            var el = $(element);
            var data = {
                display_name: el.find('input[id=display-name]').val(),
                weight: el.find('input[id=weight]').val(),
                has_score: (document.getElementById("has-score").checked ? true : false),
                set_retry_count: el.find('input[id=set-retry-count]').val(),
                items: [],
                categories: [],
            };
            $('.item-category-content').each(function () {
                if($(this).hasClass("item")){
                    var item = {};
                    item.id = $(this).find(".general-container .value-input").val();
                    if($(this).find(".general-container .item-type-select option:selected").val() == "text"){
                        item.type = "text";
                        item.value = $(this).find(".value-container .value-input").val();
                    }
                    else{
                        item.type = "image";
                        item.value = $(this).find(".value-container .image-url").val();
                    }
                    item.category_id = $(this).find(".value-container .category-id").val();
                    item.zone_id = $(this).find(".value-container .zone-id").val();
                    data.items.push(item)
                }
                else if($(this).hasClass("category")){
                    var category = {
                        zones: [],
                    };
                    category.id = $(this).find(".general-container .value-input").val();
                    category.name = $(this).find(".general-container .category-name").val();
                    category.text = $(this).find(".general-container .category-text").val();
                    if($(this).find(".general-container .category-type-select option:selected").val() == "text"){
                        category.type = "text";
                        var value = $(this).find(".value-container .value-input").val();
                        category.value = value;

                        var matches = regexItems(value);
                        for(var i in matches){
                            var zone = {};
                            zone.id = matches[i];
                            category.zones.push(zone);
                        }

                    }
                    else if($(this).find(".general-container .category-type-select option:selected").val() == "image"){
                        category.type = "image";
                        category.value = $(this).find(".value-container .image-url").val().replace("localhost:8000", "");
                        $(this).find(".value-container .preview-image .category-zone").each(function () {  
                            var zone = {};
                            zone.id = $(this).find(".zone-id").val();
                            zone.style = $(this).attr("style");
                            category.zones.push(zone);
                        });
                    }
                    else if($(this).find(".general-container .category-type-select option:selected").val() == "blank"){
                        category.type = "blank";
                        $(this).find(".value-container").each(function () {  
                            var zone = {};
                            zone.name = $(this).find(".zone-name").val();
                            zone.id = $(this).find(".zone-id").val();
                            zone.width = $(this).find(".zone-width").val();
                            zone.height = $(this).find(".zone-height").val();
                            category.zones.push(zone);
                        });
                    }
                    data.categories.push(category);
                }
            });            
            var handlerUrl = runtime.handlerUrl(element, 'studio_submit');

            $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
                window.location.reload(false);
            });
        }
        else{
            $("#assessment-factory-tab-container").before("<p class='studio-error-message'>" + 
                "<i class='fa fa-exclamation-triangle' aria-hidden='true'></i>" +
                "    " + validation.message + " Please correct before submitting again." +
                "</p>");

            $('.studio-error-message').delay(5000).fadeOut(300, function(){
               $(this).remove();
            });
        }
    });

    /* Function for canceling  */
    $(element).on('click', '.cancel-button', function() {
        runtime.notify('cancel', {});
    });

    $(element).on('click', '.remove-button', function() {
        $(this).parent().remove();
        removeButton();
    });

    $(element).on('click', '.remove-image', function() {
        var $parent = $(this).parent();
        $parent.find(".value-input").val("");
        $parent.find(".preview-image").remove();
        $parent.find('.upload-image').remove();
        $parent.find('.remove-image').remove();
    });

    $(element).on('dblclick', '.category-value .preview-image', function(e) {
        $(".image-category-instructions").remove();
        var parent = $(this).parent();
        var parentOffset = parent.offset();
        var left_pos = e.pageX - parentOffset.left - 25 + "px";
        var top_pos = e.pageY - parentOffset.top - 85 + "px";

        var $element = $("<div></div>").addClass("category-zone").css({
            "width": "100px",
            "height": "100px",
            "position": "absolute",
            "top": top_pos,
            "left": left_pos
        });
        $(this).append($element);
        $element.append('<i class="fa fa-times-circle remove-zone" aria-hidden="true"></i>');
        $element.append('<input class="zone-id" type="text" placeholder="Zone ID" />');
        initDraggable($element);
        initResizable($element);

    });

    $(element).on('click', '.remove-zone', function() {
        $(this).parent().remove();
    });

    $(element).on('click', '.preview-asset-image', function() {        
        if($(this).siblings(".image-url").val()){
            $(this).siblings(".preview-image").remove();
            var input_element = $(this).siblings(".image-url");
            var value = input_element.val();
            var url = value.replace("localhost:8000", "");

            var $preview = $("<div></div>").addClass("preview-image");

            if($(this).parent().hasClass("category-value")){
                $preview.css({
                    "height": "400px",
                    "width": "800px",
                    "background-image": "url(" + url + ")",
                    "background-size": "cover"
                });
                $preview.append('<p class="image-category-instructions">Double click anywhere on the image to add zone for item!</p>');
            }
            if($(this).parent().hasClass("item-value")){
                $preview.css({
                    "height": "200px",
                    "width": "400px",
                    "background-image": "url(" + url + ")",
                    "background-size": "cover"
                });
            }

            $(this).parent().append($preview);
        }
    });

    function selectOnChange(){
        $('select').on('change', function() {
            var $el = $(this).parent().parent().find(".value-container");
            $el.empty();

            if($el.length > 1){
                $el.not(':first').remove();
            }

            if(this.value == "text"){
                if($(this).hasClass("item-type-select")){
                    $el.addClass("item-value");
                    $el.append('<p>Item Value</p>');
                    $el.append('<input class="value-input" type="text" placeholder="Value">');
                    $el.append('<p>Zone ID</p>');
                    $el.append('<input class="zone-id" type="text" placeholder="Zone ID">');
                }
                else if($(this).hasClass("category-type-select")){
                    $el.addClass("category-value");
                    $el.append('<p>Category Value</p>');
                    $el.append('<textarea class="value-input" rows="4" placeholder="Value"></textarea>');
                }
            }
            else if(this.value == "image"){
                if($(this).hasClass("item-type-select")){
                    $el.addClass("item-value");
                    $el.append('<p>Item Value</p>');
                    $el.append('<input class="image-url" type="text" placeholder="Image URL" />');
                    $el.append('<button class="af-btn preview-asset-image">Preview</button>');
                    $el.append('<p>Zone ID</p>');
                    $el.append('<input class="zone-id" type="text" placeholder="Zone ID">');
                }
                else if($(this).hasClass("category-type-select")){
                    $el.addClass("category-value");
                    $el.append('<p>Category Value</p>');
                    $el.append('<input class="image-url" type="text" placeholder="Image URL" />');
                    $el.append('<button class="af-btn preview-asset-image">Preview</button>');
                }
            }
            else if(this.value == "blank"){
                if($(this).hasClass("category-type-select")){
                    $el.remove();
                    var $sibling = $(this).parent().parent().find(".general-container");
                    var $div = ('<div class="value-container category-value">' +
                                    '<p>Zone Name</p>' +
                                    '<input class="zone-name" type="text" placeholder="Zone Name">' + 
                                    '<p>Zone ID</p>' +
                                    '<input class="zone-id" type="text" placeholder="Zone ID">' +
                                '</div>');
                    $sibling.after($div);
                    $sibling.after($div);
                }
            }
        });
    }

    $(function ($) {
        removeButton();
        selectOnChange();
    });
}

function removeButton(){
    $(".remove-button").remove();
    var $items = $("#tabs-items");
    var $categories = $("#tabs-categories");

    if($items.find(".item-category-content").length > 2){
        $items.children('.item-category-content').each(function () {
            $(this).append("<p class='af-btn remove-button'>Remove</p>");
        }); 
    }
    if($categories.find(".item-category-content").length > 2){
        $categories.children('.item-category-content').each(function () {
            $(this).append("<p class='af-btn remove-button'>Remove</p>");
        }); 
    }
}

function validateSubmit(){
    var data = {
        is_valid: true,
        message: undefined
    };

    $('.item-category-content').find("input[type=text]").each(function () {
        if(!$(this).val()){
            data.is_valid = false;
            data.message = "One of your text inputs are empty!"
            return false;
        }
    });
    $('.item-category-content').find("textarea").each(function () {
        if(!$(this).val()){
            data.is_valid = false;
            data.message = "One of your text areas are empty!"
            return false;
        }
        else if(!$(this).hasClass("category-text")){
            var value = $(this).val();
            var matches = regexItems(value);
            if(matches.length <= 0){
                data.is_valid = false;
                data.message = "Zone not added in one of the text categories."
                return false;
            } 
        }
    }); 

    $('.item-category-content').find(".preview-image").each(function () {
        if($(this).parent().hasClass("category-value")){
            if (!$(this).find('.category-zone').length != 0) {            
                data.is_valid = false;
                data.message = "Zone in one of the categories is not added."
                return false;
            }
        }
    });

    return data;
}

function initResizable(element){
    $(element).resizable({
        containment: $(element).parent(),
        minHeight: 100,
        minWidth: 100,
        stop: function(event, ui) {
        }
    });     
};

function initDraggable(element) {
    $(element).draggable({
        containment: $(element).parent(),
        snap: $(element).parent(),
        snapTolerance: 10,
        start: function( event, ui ) {
        }                
    });
};

function regexItems(value){
    var regex = /\$\$(.+?)\$\$/g
    var matches = [];
    var match = regex.exec(value);
    while (match != null) {
        matches.push(match[1]);
        match = regex.exec(value);
    }
    return matches;
};