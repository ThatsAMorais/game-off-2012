#pragma strict

var base : Transform;
var tree : Transform;
var forker : Transform;
var brancher : Transform;
var branch : Transform;
var fork : Transform;
var fortification : Transform;
var init_number_of_trees : int;
var init_number_of_forkers : int;
var init_number_of_branchers : int;
var y_placement : float;
var groundTexture1 : Texture2D;
var groundTexture2 : Texture2D;
// "constants"
var lo_index : int = 0;
var hi_index : int = 32;

private var forkerCount : int;
private var brancherCount : int;
private var branchCount : int;
private var forkCount : int;
private var fortificationCount : int;

private var brancher_positions : Array = new Array(new Vector2(27, 24),
												   new Vector2(26, 25),
												   new Vector2(25, 27),
												   new Vector2(23, 28));
private var forker_positions : Array = new Array(new Vector2(6,3),
												 new Vector2(6,5),
												 new Vector2(6,7),
												 new Vector2(4,7));


function SetupPiece(piece : Transform, x, y, name)
{
	piece.parent = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform;
	piece.transform.position = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform.position;
	piece.transform.position.y = y_placement;
	piece.transform.localScale = Vector3(1, 1, 1);
	piece.name = name;
}

function CreateBase(x, y, color:Color, name)
{
	var baseClone : Transform = Instantiate(base);
	SetupPiece(baseClone, x, y, name);
	baseClone.renderer.material.color = color;
	piece.transform.localScale = Vector3(2, 20, 2);
}

function CreateBranch(x, y)
{
	var branchClone : Transform = Instantiate(branch);
	SetupPiece(branchClone, x, y, String.Format("branch_{0}", branchCount));
	branchCount++;
}

function CreateForker(x, y)
{
	var forkerClone : Transform = Instantiate(forker);
	SetupPiece(forkerClone, x, y, String.Format("forker_{0}", forkerCount));
	forkerCount++;
}

function CreateFork(x, y)
{
	var forkClone : Transform = Instantiate(fork);
	SetupPiece(forkClone, x, y, String.Format("fork_{0}", forkCount));
	forkCount++;
}

function CreateBrancher(x, y)
{
	var brancherClone : Transform = Instantiate(brancher);
	SetupPiece(brancherClone, x, y, String.Format("brancher_{0}", brancherCount));
	brancherCount++;
}


function CreateFortification(x, y)
{
	var fortificationClone : Transform = Instantiate(fortification);
	SetupPiece(fortificationClone, x, y, String.Format("fortification_{0}", fortificationCount));
	fortificationCount++;
}



function Start () {

	var tex : Texture2D = null;
	var treesPlaced : int = 0;

	// This loop is pretty grotesque, but 1024 iterations might not be too bad...
	for(var x=0; x < hi_index; x++)
	{
		for(var y=0; y < hi_index; y++)
		{
			// Determine a random texture from the two defined.
			if(1 == Random.Range(1,3))
			{
				tex = groundTexture2;
			}
			else
			{
				tex = groundTexture1;
			}
			
			// Set the texture
			gameObject.Find(String.Format("/HexPlain/_{0}_{1}_", x, y)).renderer.material.mainTexture = tex;
			
			// Place trees
			if((treesPlaced < init_number_of_trees) && (2 == Random.Range(1,20)))
			{
				/*var treeClone : Transform = Instantiate(tree,
														gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform.position,
														Quaternion.identity);*/
				var treeClone : Transform = Instantiate(tree);
				treeClone.parent = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform;
				treeClone.transform.position = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform.position;
				treeClone.transform.position.y = y_placement;
				treeClone.transform.localScale = Vector3(0.4, 0.4, 0.4);
				treesPlaced += 1;
			}
		}
	}

	//Create the base.
	CreateBase(3, 3, Color.red, "ForkerBase");
	

	//for(var f=0; f < init_number_of_forkers; f++)
	//{
	//}
	CreateForker(6,3);
	CreateBranch(7,3);
	CreateForker(6,5);
	CreateBranch(7,5);
	CreateForker(6,7);
	CreateBranch(7,7);
	CreateForker(4,7);
	CreateBranch(5,7);
	
	//Create the base.
	CreateBase(28, 28, Color.blue, "BrancherBase");
	
	//for(var b=0; b < init_number_of_branchers; b++)
	//{
	//}
	CreateBrancher(27, 24);
	CreateBranch(27, 23);
	CreateBrancher(26, 25);
	CreateBranch(26, 24);
	CreateBrancher(25, 27);
	CreateBranch(25, 26);
	CreateBrancher(23, 28);
	CreateBranch(23, 27);
}

function Update () {
	if (Input.GetButtonDown("Fire1")) {
		
	}
}
