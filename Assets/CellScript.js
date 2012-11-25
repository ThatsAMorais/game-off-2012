#pragma strict
//#pragma downcast

private var inhabitant : Transform;
private var inhabitant_occupied : boolean = false;
var inhabitant_pos : Vector2 = new Vector2(0, 0);
private var branch_bush : Transform;
private var branch_bush_occupied : boolean = false;
var branch_bush_pos : Vector2 = new Vector2(.5, -.5);
private var item_drop_a : Transform;
private var item_drop_a_occupied : boolean = false;
var item_drop_a_pos : Vector2 = new Vector2(-.5, .5);
private var item_drop_b : Transform;
private var item_drop_b_occupied : boolean = false;
var item_drop_b_pos : Vector2 = new Vector2(-.5, -.5);

// This table corresponds to the one in UnitScript.js regarding HEADING
private var NUMBER_OF_NEIGHBORS : int = 6;
private var NEIGHBOR_AHEAD : int = 0;
private var NEIGHBOR_AHEAD_ANGLE : int = 0;
private var NEIGHBOR_AHEAD_POS : Vector2;

private var NEIGHBOR_LEFT : int = 1;
private var NEIGHBOR_LEFT_ANGLE : int = 60;
private var NEIGHBOR_LEFT_POS : Vector2;

private var NEIGHBOR_BACK_LEFT : int = 2;
private var NEIGHBOR_BACK_LEFT_ANGLE : int = 120;
private var NEIGHBOR_BACK_LEFT_POS : Vector2;

private var NEIGHBOR_RIGHT : int = 3;
private var NEIGHBOR_RIGHT_ANGLE : int = -60;
private var NEIGHBOR_RIGHT_POS : Vector2;

private var NEIGHBOR_BACK_RIGHT : int = 4;
private var NEIGHBOR_BACK_RIGHT_ANGLE : int = -120;
private var NEIGHBOR_BACK_RIGHT_POS : Vector2;

private var NEIGHBOR_BEHIND : int = 5;
private var NEIGHBOR_BEHIND_ANGLE : int = 180;
private var NEIGHBOR_BEHIND_POS : Vector2;

private var idx = {NEIGHBOR_AHEAD_ANGLE : NEIGHBOR_AHEAD,
				   NEIGHBOR_LEFT_ANGLE : NEIGHBOR_LEFT,
				   NEIGHBOR_BACK_LEFT_ANGLE : NEIGHBOR_BACK_LEFT,
				   NEIGHBOR_RIGHT_ANGLE : NEIGHBOR_RIGHT,
				   NEIGHBOR_BACK_RIGHT_ANGLE : NEIGHBOR_BACK_RIGHT,
				   NEIGHBOR_BEHIND_ANGLE : NEIGHBOR_BEHIND};

private var neighbors : Vector2[] = new Vector2[NUMBER_OF_NEIGHBORS];
private var myLocation : Vector2 = Vector2(-1,-1);

private var selectedHighlightOn : boolean = false;
private var selectedHighlightColor : Color = Color.green;
private var selectedHighlightMod : float = 0.5;

private var pathHighlightColor_valid : Color = Color.white;
private var pathHighlightColor_invalid : Color = Color.red;
private var pathHighlightColor_out_of_range : Color = Color.gray;
private var pathHighlightOn : boolean = false;
private var pathHighlightMod : float = 0.5;
private var pathHighlightColor : Color = pathHighlightColor_out_of_range;

private var targetedHighlightColor_passive : Color = Color.blue;
private var targetedHighlightColor_invalid : Color = Color.red;
private var targetedHighlightOn : boolean = false;
private var targetedHighlightColor : Color = Color.blue;
private var targetedHighlightMod : float = 0.5;
private var targetedHighlightTimediff : float = 0;

private var mouseoverHighlightOn : boolean = false;
private var mouseoverHighlightColor : Color = Color.yellow;
private var mouseoverHighlightMod : float = 0.5;

private var inhabitants = {};

/*
// General Factory
function makeStruct(names)
{
	var names = names.split(',');
	var count = names.length;
	
	function constructor() {
		for(var i=0; i < count; i++)
		{
			this[names[i]] = arguments[i];
		}
	}
	
	return constructor;
}

// Make a Cell "Inhabitant" class/struct
var Inhabitant = makeStruct("transform,occupied,position");
*/


function Start () {

	// Parse this cell's position
	var delimiter : String = "_";
	var coordStrings = gameObject.name.Split(delimiter.ToCharArray());
	myLocation = new Vector2(parseInt(coordStrings[1]), parseInt(coordStrings[2]));
	
	// Set neighbors
	SetNeighbors();

	// Particle system off initially	
	ToggleParticleSystem(false);
}

function Update ()
{
	if(pathHighlightOn)
	{
		DoPathHighlight();
	}
	else if(mouseoverHighlightOn)
	{
		DoMouseoverHighlight();
	}
	else if(selectedHighlightOn)
	{
		DoSelectedHighlight();
	}
	else if(targetedHighlightOn)
	{
		DoTargetedHighlight();
	}
}

function OnMouseOver()
{
	mouseoverHighlightOn = true;
}

function OnMouseExit()
{
	mouseoverHighlightOn = false;
	mouseoverHighlightMod = 0.5;
	ToggleParticleSystem(false);
}

function Targeted(val : boolean)
{
	
	targetedHighlightOn = val;
	targetedHighlightMod = 0.5;
	targetedHighlightTimediff = 0;
	
	if(!targetedHighlightOn)
	{
		ToggleParticleSystem(false);
	}
}

function Selected(val : boolean)
{
	selectedHighlightOn = val;
	selectedHighlightMod = 0.5;
	
	if(!selectedHighlightOn)
	{
		ToggleParticleSystem(false);
	}
}

function SetPathHighlight(val : boolean, type : String)
{
	pathHighlightOn = val;
	pathHighlightMod = 0.5;
	
	if(pathHighlightOn)
	{
		switch(type)
		{
			case "valid":
				pathHighlightColor = pathHighlightColor_valid;
				break;
			case "invalid":
				pathHighlightColor = pathHighlightColor_invalid;
				break;
			case "out_of_range":
				pathHighlightColor = pathHighlightColor_out_of_range;
				break;
		}
	}
	else
	{
		ToggleParticleSystem(false);
	}
}

function GetParticleSystem()
{
	return gameObject.GetComponent(ParticleSystem);
}

function ToggleParticleSystem(on : boolean)
{
	var particleSystem : ParticleSystem = GetParticleSystem();
	if(on)
	{
		if(!particleSystem.isPlaying)
			particleSystem.Play();
	}
	else
	{
		particleSystem.Stop();
		particleSystem.Clear();
	}
}

function FadeColor(color : Color, mod : float, speed : int)
{
	var direction : int = 100 > mod ? 1 : -1;
	
	mod += direction * speed * Time.deltaTime;
	color.a += mod;
	
	//gameObject.renderer.material.color = color;
	
	GetParticleSystem().renderer.material.color = color;
	ToggleParticleSystem(true);
	
	return Time.deltaTime;
}

function DoMouseoverHighlight()
{
	FadeColor(mouseoverHighlightColor, mouseoverHighlightMod, 5);
}

function DoTargetedHighlight()
{
	targetedHighlightTimediff = FadeColor(targetedHighlightColor, targetedHighlightMod, 10);
	
	if(targetedHighlightTimediff >= 2)
	{
		targetedHighlightOn = false;
	}
}

function DoSelectedHighlight()
{
	FadeColor(selectedHighlightColor, selectedHighlightMod, 2);
}

function DoPathHighlight()
{
	FadeColor(pathHighlightColor, pathHighlightMod, 3);
}



function GetMapSize()
{
	return GameObject.Find("HexPlain").GetComponent(HexBoardScript).GetSize();
}

function PositionValid(x : int, y : int)
{
	if((0 > x) || (GetMapSize().x < x) ||
	   (0 > y) || (GetMapSize().y < y))
		return false;
	
	return true;
}

function GetNeighbor(neighbor : int)
{
	var neighborPos : Vector2 = Vector2(-1,-1);
	
	switch(neighbor)
	{
		case NEIGHBOR_AHEAD:
			neighborPos = NEIGHBOR_AHEAD_POS;
			break;
		case NEIGHBOR_BEHIND:
			neighborPos = NEIGHBOR_BEHIND_POS;
			break;
		case NEIGHBOR_LEFT:
			neighborPos = NEIGHBOR_LEFT_POS;
			break;
		case NEIGHBOR_RIGHT:
			neighborPos = NEIGHBOR_RIGHT_POS;
			break;
		case NEIGHBOR_BACK_LEFT:
			neighborPos = NEIGHBOR_BACK_LEFT_POS;
			break;
		case NEIGHBOR_BACK_RIGHT:
			neighborPos = NEIGHBOR_BACK_RIGHT_POS;
			break;
	}
	
	return neighborPos;
}

function SetNeighbors()
{	
	var invalidPos = Vector2(-1,-1);
	
	/* Ahead */
	NEIGHBOR_AHEAD_POS = PositionValid(myLocation.x+1, myLocation.y) ? invalidPos : Vector2(myLocation.x+1, myLocation.y);
	/* Behind */
	NEIGHBOR_BEHIND_POS = PositionValid(myLocation.x-1, myLocation.y) ? invalidPos : Vector2(myLocation.x-1, myLocation.y);
	/* Left */
	NEIGHBOR_LEFT_POS = PositionValid(myLocation.x, myLocation.y-1) ? invalidPos : Vector2(myLocation.x, myLocation.y-1);
	/* Right */
	NEIGHBOR_RIGHT_POS = PositionValid(myLocation.x, myLocation.y+1) ? invalidPos : Vector2(myLocation.x, myLocation.y+1);
	/* Back-Left */
	NEIGHBOR_BACK_LEFT_POS = PositionValid(myLocation.x-1, myLocation.y-1) ? invalidPos : Vector2(myLocation.x-1, myLocation.y-1);
	/* Back-Right */
	NEIGHBOR_BACK_RIGHT_POS = PositionValid(myLocation.x-1, myLocation.y+1) ? invalidPos : Vector2(myLocation.x-1, myLocation.y+1);
}

function GetInhabitant(slot : String)
{
	var piece : Transform;
	if(SlotInhabitated(slot))
	{
		if("inhabitant" == slot)
		{
			piece = inhabitant;
		}
		else if("drop_a" == slot)
		{
			piece = item_drop_b;
		}
		else if("drop_b" == slot)
		{
			piece = item_drop_b;
		}
		else if("bush" == slot)
		{
			piece = branch_bush;
		}
	}
	
	return null;
}

function SlotInhabitated(slot : String)
{
	if("inhabitant" == slot)
	{
		return inhabitant_occupied;
	}
	else if("drop_a" == slot)
	{
		return item_drop_a_occupied;
	}
	else if("drop_b" == slot)
	{
		return item_drop_b_occupied;
	}
	else if("bush" == slot)
	{
		return branch_bush_occupied;
	}

	return true;
}

function SlotPos(slot : String)
{	
	var slotPosition : Vector2 = new Vector2(-1,-1);
	
	if("inhabitant" == slot)
	{
		slotPosition = inhabitant_pos;
	}
	else if("drop_a" == slot)
	{
		slotPosition = item_drop_a_pos;
	}
	else if("drop_b" == slot)
	{
		slotPosition = item_drop_b_pos;
	}
	else if("bush" == slot)
	{
		slotPosition = branch_bush_pos;
	}

	return slotPosition;
}

// I broke this out because its reused a few times.
function PositionInhabitant(slot : String, new_inhabitant : Transform)
{
	var z = new_inhabitant.localPosition.z;
	new_inhabitant.parent = gameObject.transform;
	new_inhabitant.localPosition = new Vector3(SlotPos(slot)[0], SlotPos(slot)[1], z);
}

function SetInhabitant(type : String, new_inhabitant : Transform)
{	
	var result = true;
	
	switch(type)
	{
		case "unit":
			if(false == SlotInhabitated("inhabitant"))
			{
				PositionInhabitant("inhabitant", new_inhabitant);
			}
			else
			{
				// Toggle some UI to depict a failed attempt to position here
			}
			break;
			
		case "pickup":
			if(false == SlotInhabitated("drop_a"))
			{
				PositionInhabitant("drop_a", new_inhabitant);
			}
			else if(false == SlotInhabitated("drop_b"))
			{
				PositionInhabitant("drop_b", new_inhabitant);
			}
			else
			{
				// Toggle some UI to depict a failed attempt to position here
			}
			break;

		case "bush":
			if(false == SlotInhabitated("bush"))
			{
				PositionInhabitant("bush", new_inhabitant);
			}
			else
			{
				// Toggle some UI to depict a failed attempt to position here
			}
			break;
		default:
			result = false;
	}
	
	return result;
}


function MoveTo(piece : Transform)
{
	var result : boolean = true;
	
	if(piece.name.Contains("forker") || piece.name.Contains("brancher"))
	{
		SetInhabitant("unit", piece);
	}
	else if(piece.name.Contains("branch") || piece.name.Contains("fork") || piece.name.Contains("fortification"))
	{
		SetInhabitant("pickup", piece);
	}
	else if(piece.name.Contains("branchbush"))
	{
		SetInhabitant("bush", piece);
	}
	else
	{
		result = false;
	}
	
	return result;
}