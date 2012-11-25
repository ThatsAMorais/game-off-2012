#pragma strict

var branch : Transform;

private var branchCount : int = 4;
private var world_position : Vector2;

function Start ()
{
}

function Update ()
{
}

function SetPosition(x : int, y : int)
{
	world_position = new Vector2(x,y);
}

function CreateBranch(x : int, y : int)
{
	var name : String = String.Format("branch_{0}", branchCount);
	var branchClone : Transform = Instantiate(branch);
	
	GameObject.Find("HexPlain").GetComponent(HexBoardScript).SetupPiece(branchClone, x, y, 2, name);
	
	GameObject.Find(name).GetComponent(PickupScript).SetPosition(x,y);
	branchCount++;
}

function TakeBranch()
{
	branchCount--;
}

function GetBranchCount()
{
	return branchCount;
}

function GetCellScript()
{
	return GameObject.Find(String.Format("HexPlain/_{0}_{1}_", world_position.x, world_position.y)).GetComponent(CellScript);
}


function Target()
{
	GetCellScript().Targeted(true);
}
function UnTarget()
{
	GetCellScript().Targeted(false);
}
