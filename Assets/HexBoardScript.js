#pragma strict

var base : Transform;
var tree : Transform;
var forker : Transform;
var brancher : Transform;
var fortification : Transform;
var number_of_trees : int;
var number_of_forkers : int;
var number_of_branchers : int;
var y_placement : float;

var groundTexture1 : Texture2D;
var groundTexture2 : Texture2D;

// "constants" (though not really, just in practice)
var lo_index : int = 0;
var hi_index : int = 32;

function Start () {

	var tex : Texture2D = null;
	var basePlaced : boolean = false;
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
			if((treesPlaced < number_of_trees) && (2 == Random.Range(1,20)))
			{
				/*var treeClone : Transform = Instantiate(tree,
														gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform.position,
														Quaternion.identity);*/
				var treeClone : Transform = Instantiate(tree);
				treeClone.parent = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform;
				treeClone.transform.position = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform.position;
				treeClone.transform.position.y = y_placement;
				treeClone.transform.localScale = Vector3(0.5, 0.5, 0.5);
				treesPlaced += 1;
			}
		}
	}

	//Create the base.
	var baseClone1 : Transform = Instantiate(base);
	baseClone1.transform.position = gameObject.Find("/HexPlain/_3_3_").transform.position;
	baseClone1.transform.position.y = y_placement;
	baseClone1.renderer.material.color = Color.red;
	baseClone1.name = "ForkerBase";
	

	//for(var f=0; f < number_of_forkers; f++)
	//{
	//}
	CreateForker(6,3);
	CreateForker(6,5);
	CreateForker(6,7);
	CreateForker(4,7);
	
	//Create the base.
	var baseClone2 : Transform = Instantiate(base);
	baseClone2.transform.position = gameObject.Find("/HexPlain/_28_28_").transform.position;
	baseClone2.transform.position.y = y_placement;
	baseClone2.renderer.material.color = Color.blue;
	baseClone2.name = "BrancherBase";
	
	//for(var b=0; b < number_of_branchers; b++)
	//{
	//}
	CreateBrancher(27,24);
	CreateBrancher(26,25);
	CreateBrancher(25,27);
	CreateBrancher(23,28);
}

function Update () {
	if (Input.GetButtonDown("Fire1")) {
		
	}
}

function CreateForker(x, y)
{
	var forkerClone : Transform;
	forkerClone = Instantiate(forker);
	forkerClone.parent = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform;
	forkerClone.transform.localScale = Vector3(1, 1, 1);
	forkerClone.transform.position = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform.position;
	forkerClone.transform.position.y = y_placement;
}

function CreateBrancher(x, y)
{
	var brancherClone : Transform;
	brancherClone = Instantiate(brancher);
	brancherClone.parent = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform;
	brancherClone.transform.localScale = Vector3(1, 1, 1);
	brancherClone.transform.position = gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform.position;
	brancherClone.transform.position.y = y_placement;
}