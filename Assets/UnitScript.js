#pragma strict



// Public
var fork : Transform;
var fortification : Transform;
var item_placement = 0;
var team_player : boolean = false;
var home_base : Transform = null;
var unitType : String;
var ACTION_POINTS_PER_TURN : int = 3;
var dead : boolean = false;

private var HEADING_STRAIGHT = 0;
private var HEADING_LEFT = 60;
private var HEADING_BACK_LEFT = 120;
private var HEADING_RIGHT = -60;
private var HEADING_BACK_RIGHT = -120;
private var HEADING_BACK = 180;

var heading : int = HEADING_STRAIGHT;

// Stats
private var forkCount : int = 0;
private var fortificationCount : int = 0;

// States and Status
private var newly_created : boolean = true;
private var branches_held : int = 0;
private var world_position : Vector2;
private var in_hand : Transform = null;

private var action_points = ACTION_POINTS_PER_TURN;
private var target_position : Vector2;

// Animate variables
private var newly_created_rotation = 0;

// MouseOver //
private var startcolor : Color;


function Start ()
{
	// Determine the unit-type
	unitType = gameObject.name.Contains("forker") ? "forker" : "brancher";
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

function SetTarget(x : int, y : int)
{
	target_position = new Vector2(x,y);
}

function SetPosition(x : int, y : int)
{
	world_position = new Vector2(x,y);
	RotateToHeading();
}

function GetPosition()
{
	return world_position;
}

function GetUnitType()
{
	return unitType;
}


function DoNewUnitAnimation()
{
	var angle = 90.0*Time.deltaTime;
	newly_created_rotation += angle;
	
	// Don't let the rotation exceed 360 degrees
	if(360 < newly_created_rotation)
	{
		angle -= newly_created_rotation - 360;
	}
	
	gameObject.transform.Rotate(0.0, angle, 0.0);
	
	if(newly_created_rotation >= 360)
	{
		newly_created = false;
	}
}

function SetupPiece(piece : Transform, x : int, y : int, z : float, name : String)
{
	GameObject.Find("HexPlain").GetComponent(HexBoardScript).SetupPiece(piece, x, y, z, name);
}

function CreateFork()
{
	var forkClone : Transform = Instantiate(fork);
	forkCount++;
	return forkClone;
}

function CreateFortification()
{
	var fortificationClone : Transform = Instantiate(fortification);
	fortificationCount++;
	return fortificationClone;
}

function FormatUnitName(item : String)
{
	return String.Format("{0}_{1}",
						item,
		 				(item == "fork" ? GetForkCount() : GetFortificationCount()));
}

function RotateToHeading()
{
	gameObject.transform.localRotation = Quaternion.identity;
	gameObject.transform.Rotate(new Vector3(0,heading,0));
}

function SetHeading(newHeading : int)
{
	heading = newHeading;
	RotateToHeading();
}

function GetHeading()
{
	return heading;
}

function GetCellScript()
{
	return GameObject.Find(String.Format("HexPlain/_{0}_{1}_", world_position.x, world_position.y)).GetComponent(CellScript);
}

function GetNeighbor(direction : int)
{
	var neighborDir = (heading + direction);
	neighborDir = ((neighborDir-180)%360) + (neighborDir < 180 ? 180 : -180);
	neighborDir = (neighborDir == -180) ? 180 : neighborDir;
	Debug.Log(neighborDir);
	
	var neighborPos : Vector2 = GetCellScript().GetNeighbor(neighborDir);
	return neighborPos;
}

function GetMapSize()
{
	return GameObject.Find("HexPlain").GetComponent(HexBoardScript).GetSize();
}

function PositionValid(position : Vector2)
{
	if(0 > position.x || GetMapSize().x < position.x ||
	   0 > position.y || GetMapSize().y < position.y)
		return false;
	
	return true;
}

function TossItem(item : Transform, toss_direction : int)
{
	var neighboringPos : Vector2 = GetNeighbor(toss_direction);
	SetupPiece(item, neighboringPos.x, neighboringPos.y, item_placement, item.name);
}

function GraspItem(item : Transform)
{
	if(null != in_hand)
	{
		TossItem(in_hand, HEADING_RIGHT);
	}
	
	item.parent = gameObject.transform;
	if(item.name.Contains("fork"))
	{
		item.localPosition = Vector3(-1,1,0);
		item.localRotation = Quaternion.identity;
		item.Rotate(Vector3(0,180,90));
		item.localScale = Vector3(0.2,0.2,0.2);
	}
	else if(item.name.Contains("fortification"))
	{
		item.localPosition = Vector3(-1,1,0);
		item.localScale = Vector3(0.2,0.2,0.2);
	}
	
	item.GetComponent(PickupScript).SetPosition(GetPosition().x,GetPosition().y);
}

function CreateItem()
{
	var name : String = FormatUnitName(unitType == "forker" ? "fork" : "fortification");
	var item : Transform;
	switch(unitType)
	{
		case "forker":
			item = CreateFork();
			break;
		case "brancher":
			item = CreateFortification();
			break;
	}
	
	item.name = name;
	
	GraspItem(item);
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

function Kill()
{
	dead = true;
	home_base.GetComponent(BaseScript).UnitDeath(unitType);
	Destroy(gameObject);
}


function GetFortificationCount()
{
	return fortificationCount;
}

function DoSelectedGUI(rect : Rect)
{
	GUILayout.BeginArea(rect);
	
	if(GUILayout.Button(String.Format("Create {0}", GetUnitType() == "forker" ? "Fork" : "Fortification")))
	{
		CreateItem();
	}
	
	GUILayout.FlexibleSpace();
	
	if(GUILayout.Button("Kill Unit"))
	{
		Kill();
	}

	GUILayout.EndArea();
}

function FindPathTo(x : int, y : int)
{
	// Recursively highlight 
}