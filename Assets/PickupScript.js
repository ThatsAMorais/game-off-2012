#pragma strict

private var condition : int = 100;
private var world_position : Vector2 = Vector2(-1,-1);

function Start () {

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

function Damage(dmg : int)
{
	condition -= dmg;
}

function Targeted(selection : Transform)
{
}

function Selected(selected : boolean) : boolean
{
	// TODO: Could always add some GUI later, but for now, not selectable
	return false;
}

function DoSelectedGUI(rect : Rect)
{
}