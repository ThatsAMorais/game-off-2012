#pragma strict

var branch : Transform;
private var branchCount : int;


function Start () {

}

function Update () {

}

function CreateBranch(x, y)
{
	var branchClone : Transform = Instantiate(branch);
	GameObject.Find("HexPlain").GetComponent(HexBoardScript).SetupPiece(branchClone, x, y, 2, String.Format("branch_{0}", branchCount));
	branchCount++;
}

function GetBranchCount()
{
	return branchCount;
}