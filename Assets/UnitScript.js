#pragma strict

// Public
var fork : Transform;
var fortification : Transform;
var item_placement = 0;
var team_player : boolean = false;
var home_base : Transform = null;

// Stats
private var forkCount : int = 0;
private var fortificationCount : int = 0;

// States and Status
private var newly_created : boolean = true;
private var holding_a_fork : boolean = false;
private var number_of_branches_held : int = 0;

// Animate variables
private var newly_created_rotation = 0;

// MouseOver //
private var startcolor : Color;


function Start ()
{
}

function Update ()
{
	// Do the unit created animation
	if(newly_created)
	{
		DoNewUnitAnimation();
	}
}

function OnMouseEnter()
{
    //startcolor = renderer.material.color;
    //renderer.material.color = Color.yellow;
}
function OnMouseExit()
{
    //renderer.material.color = startcolor;
}

function DoNewUnitAnimation()
{
	var angle = 90.0*Time.deltaTime;
	newly_created_rotation += angle;
	
	gameObject.transform.Rotate(0.0, angle, 0.0);
	
	if(newly_created_rotation >= 360)
	{
		newly_created = false;
	}
}

function CreateFork(x, y)
{
	var forkClone : Transform = Instantiate(fork);
	GameObject.Find("HexPlain").GetComponent(HexBoardScript).SetupPiece(forkClone, x, y, item_placement, String.Format("fork_{0}", forkCount));
	forkCount++;
}

function CreateFortification(x, y)
{
	var fortificationClone : Transform = Instantiate(fortification);
	GameObject.Find("HexPlain").GetComponent(HexBoardScript).SetupPiece(fortificationClone, x, y, item_placement, String.Format("fortification_{0}", fortificationCount));
	fortificationCount++;
}

function SetHomeBase(homeBase : Transform)
{
	home_base = homeBase;
}

function SetTeam(teamPlayer : boolean)
{
	team_player = teamPlayer;
}

function GetForkCount()
{
	return forkCount;
}

function GetFortificationCount()
{
	return fortificationCount;
}

function DoSelectedGUI(rect : Rect)
{
	GUILayout.BeginArea(rect);
	
	if(GUILayout.Button("Create Fork"))
	{
		
	}
	
	GUILayout.EndArea();
}