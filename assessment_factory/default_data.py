DEFAULT_DATA = {
	"weight": 100.0, 
	"allow_reset": False, 
	"has_score": True, 
	"display_name": "Conservatorio's Strategy", 
	"items": [
		{
			"category_id": "c1", 
			"type": "text", 
			"id": "item-1", 
			"value": "First item - c1", 
			"zone_id": "zone-1"
		}, 
		{
			"category_id": "c1", 
			"type": "text", 
			"id": "item-2", 
			"value": "Second item - c1", 
			"zone_id": "zone-1"
		}, 
		{
			"category_id": "c1", 
			"type": "text", 
			"id": "item-3", 
			"value": "Third item - c1", 
			"zone_id": "zone-2"
		}, 
		{
			"category_id": "c1", 
			"type": "text", 
			"id": "item-4", 
			"value": "Fourth item - c1", 
			"zone_id": "zone-2"
		}, 
		{
			"category_id": "c2", 
			"type": "text", 
			"id": "item-5", 
			"value": "First item - c2", 
			"zone_id": "zone-3"
		}, 
		{
			"category_id": "c2", 
			"type": "text", 
			"id": "item-6",
			"value": "Second item - c2", 
			"zone_id": "zone-3"
		}, 
		{
			"category_id": "c2", 
			"type": "text", 
			"id": "item-7", 
			"value": "Third item - c2", 
			"zone_id": "zone-4"
		}, 
		{
			"category_id": "c2", 
			"type": "text", 
			"id": "item-8", 
			"value": "Fourth item - c2", 
			"zone_id": "zone-4"
		}
	], 
	"categories": [
		{
			"name": "Part 1",
			"text": "Below is a list of Conservatorio's investment strategies as well as traditional investment strategies. Drag and drop strategies from the list below to either the Conservatorio Strategies or Traditional Strategies column, Click CONTINUE when you've dragged all items.", 
			"type": "blank", 
			"id": "c1", 
			"zones": [
				{
					"name": "Conservatorio Strategies:", 
					"id": "zone-1"
				}, 
				{
					"name": "Traditional Strategies:", 
					"id": "zone-2"
				}
			]
		}, 
		{
			"name": "Part 2",
			"text": "There are benefits associated with Conservatorio's strategy as well as traditional buy/remodel/sell strategy. Drag and drop benefits from the list to either the Conservatorio benefits or Traditional Benefits column. Click CONTINUE when you've dragged all items.", 
			"type": "blank", 
			"id": "c2", 
			"zones": [
				{
					"name": "Conservatorio Benefits:", 
					"id": "zone-3"
				}, 
				{
					"name": "Traditional Benefits:", 
					"id": "zone-4"
				}
			]
		}
	]
}
