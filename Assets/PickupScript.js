#pragma strict

private var condition : int = 100;
private var world_position : Vector2;

function Start () {

}

function Update () {

}

function SetPosition(x : int, y : int)
{
	world_position = new Vector2(x,y);
}

function GetCondition()
{
	return condition;
}

function Damage(dmg : int)
{
	condition -= dmg;
}