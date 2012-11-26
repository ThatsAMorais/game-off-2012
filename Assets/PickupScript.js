#pragma strict

var MAX_PICKUP_CONDITION = 100;
private var condition : int = MAX_PICKUP_CONDITION;
private var world_position : Vector2 = Vector2(-1,-1);
private var itemType : String;

function Start () {
	if(gameObject.name.Contains("fork"))
	{
		itemType = "fork";
	}
	else if(gameObject.name.Contains("fortification"))
	{
		itemType = "fortification";
	}
	else if(gameObject.name.Contains("branch"))
	{
		itemType = "branch";
	}
}

function Update () {

}

function SetPosition(x : int, y : int)
{
	world_position = new Vector2(x,y);
}

function GetPosition() : Vector2
{
	return world_position;
}

function GetCondition() : int
{
	return condition;
}

function GetItemType() : String
{
	return itemType;
}

function Damage(dmg : int)
{
	condition -= dmg;
}

function Targeted(selection : GameObject)
{
}

function Selected(selected : boolean) : boolean
{
	// TODO: Could always add some GUI later, but for now, not selectable
	return false;
}

function DoSelectedGUI(rect : Rect, guiBG : Texture)
{
	GUILayout.BeginArea(rect);
	GUILayout.BeginVertical();
	
	GUILayout.Box(guiBG);



	GUILayout.EndVertical();
	GUILayout.EndArea();
}

function DoMouseoverGUI(rect : Rect, guiBG : Texture)
{
	
	GUILayout.BeginArea(rect);
	GUILayout.BeginVertical();

	GUILayout.Box(guiBG);
	
	DoStatsGUI();
	
	GUILayout.EndVertical();
	GUILayout.EndArea();

}

function DoStatsGUI()
{
	GUILayout.TextField(String.Format("Pickup : {0}", GetItemType()));
	GUILayout.TextField(String.Format("Condition: {0}", (GetCondition()/MAX_PICKUP_CONDITION)*100));
}