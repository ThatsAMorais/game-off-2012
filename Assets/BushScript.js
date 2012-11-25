#pragma strict

var branch : Transform;

private var branchCount : int = 4;
private var world_position : Vector2 = Vector2(-1,-1);

function Start ()
{
}

function Update ()
{
	if(0 >= branchCount)
	{
		Destroy(gameObject);
	}
}

function Selected(selected : boolean) : boolean
{
	return false;
}

function SetPosition(x : int, y : int)
{
	world_position = new Vector2(x,y);
}

function GetPosition() : Vector2
{
	return world_position;
}

function GetBranch(x : int, y : int) : Transform
{
	var branch : Transform = null;
	
	if(0 < branchCount)
	{
		var name : String = String.Format("branch_{0}", branchCount);
		branchCount--;
		branch = Instantiate(branch);
	}
	
	return branch;
}

function GetBranchCount()
{
	return branchCount;
}

function GetCellScript() : CellScript
{
	return GameObject.Find(String.Format("HexPlain/_{0}_{1}_", world_position.x, world_position.y)).GetComponent(CellScript);
}

function Targeted(selection : Transform)
{
}

function DoSelectedGUI(rect : Rect)
{
}

