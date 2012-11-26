#pragma strict

var branch : GameObject;

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

function GetBranch(x : int, y : int) : GameObject
{
	var branch : GameObject = null;
	
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
	return GameObject.Find(String.Format("HexPlain/cell_{0}_{1}_", world_position.x, world_position.y)).GetComponent(CellScript);
}

function Targeted(selection : GameObject)
{
}

function DoSelectedGUI(rect : Rect, guiBG : Texture)
{
	GUILayout.BeginArea(rect);
	GUILayout.Box(guiBG);
	GUILayout.EndArea();

	GUILayout.BeginArea(rect);
	GUILayout.BeginVertical();

	GUILayout.Box(guiBG);
	
	GUILayout.EndVertical();
	GUILayout.EndArea();
}

function DoMouseoverGUI(rect : Rect, guiBG : Texture)
{
	GUILayout.BeginArea(rect);
	GUILayout.Box(guiBG);
	GUILayout.EndArea();

	GUILayout.BeginArea(rect);
	GUILayout.BeginVertical();


	DoStatsGUI();
	
	GUILayout.EndVertical();
	GUILayout.EndArea();
}

function DoStatsGUI()
{
	GUILayout.TextField(String.Format("Bush"));
	GUILayout.TextField(String.Format("Branches: {0}", GetBranchCount()));
}


