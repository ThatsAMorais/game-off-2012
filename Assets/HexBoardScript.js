#pragma strict

var base : Transform;
var tree : Transform;
var forker : Transform;
var brancher : Transform;
var fortification : Transform;
var number_of_trees : int;
var y_placement : int = 0;

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
			Debug.Log(String.Format("{0},{1}", x, y));
		
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
				var treeClone : Transform = Instantiate(tree, gameObject.Find(String.Format("HexPlain/_{0}_{1}_", x, y)).transform.position, Quaternion.identity);
				treeClone.transform.position.y = y_placement;
				treeClone.transform.localScale = Vector3(0.25, 0.25, 0.25);
				treesPlaced += 1;
			}
		}
	}

	//Create the base.
	var baseClone : Transform = Instantiate(base);
	baseClone.transform.position = gameObject.Find("/HexPlain/_3_3_").transform.position;
	baseClone.transform.position.y = y_placement;
}

function Update () {
	if (Input.GetButtonDown("Fire1")) {
		
	}
}