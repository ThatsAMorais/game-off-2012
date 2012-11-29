#pragma strict

var base : GameObject;
var branch_bush : GameObject;
var guiBG_default : Texture;
var guiBG_player : Texture;
var guiBG_opponent : Texture;


private var inhabitant : GameObject;
private var inhabitant_occupied : boolean = false;
var inhabitant_pos : Vector2 = new Vector2(0, 0);

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

private var show_failed_target : boolean = false;

private var selectable : boolean = false;
private var currentMouseoverCell : Vector2;

private var owner : String = "open";

function Start ()
{
	// Parse this cell's position
	var delimiter : String = "_";
	var coordStrings = gameObject.name.Split(delimiter.ToCharArray());
	myLocation = new Vector2(parseInt(coordStrings[1]), parseInt(coordStrings[2]));
	
	gameObject.name = String.Format("cell{0}", gameObject.name);

	SetupParticleSystem();
	// Particle system off initially	
	ToggleParticleSystem(false);
}

function SetupParticleSystem()
{
	var particleSystem : ParticleSystem = GetParticleSystem();
	particleSystem.startDelay = 0;
	particleSystem.startLifetime = 2;
	particleSystem.startSpeed = 0.75;
	particleSystem.startSize = 0.25;	
}


function Update ()
{
	if(mouseoverHighlightOn)
	{
		DoMouseoverHighlight();
	}
	else if(pathHighlightOn)
	{
		DoPathHighlight();
	}
	else if(selectedHighlightOn)
	{
		DoSelectedHighlight();
	}
	else if(targetedHighlightOn)
	{
		DoTargetedHighlight();
	}
	else
	{
		ToggleParticleSystem(false);
	}
}

function OnGUI()
{
	if(mouseoverHighlightOn)
		DoMouseoverGUI();
}

function GetPosition() : Vector2
{
	return myLocation;
}

function GetRealPosition() : Vector3
{
	return gameObject.transform.position;
}

function OnMouseEnter()
{
	if(SlotInhabited())
	{
		// Enable pass-thru of Cell-GUI-area, where the inhabitant of a cell is described in general
		// TODO
		
		
		// DISABLED for now
		mouseoverHighlightOn = true;
	}
}

function OnMouseExit()
{
	mouseoverHighlightOn = false;
	mouseoverHighlightMod = 0.5;
}


function Target(x : int, y : int)
{
	var piece : GameObject = GetInhabitant();
	
	if(SlotInhabited())
	{
		if(selectable)
		{
			if(piece.name.Contains("forker") || piece.name.Contains("brancher"))
			{
				piece.GetComponent(UnitScript).SetTarget(x,y);
			}
			else if(piece.name.Contains("base"))
			{
				piece.GetComponent(BaseScript).SetTarget(x,y);
			}
		}
	}
}

function Targeted(val : boolean)
{
	if(false == val)
	{
		targetedHighlightOn = false;
		targetedHighlightMod = 0.5;
	}
	else
	{
		if(SlotInhabited())
		{
			targetedHighlightOn = val;
			targetedHighlightMod = 0.5;
			targetedHighlightTimediff = 0;
		}
	}
}

function IsSelected() : boolean
{
	return selectedHighlightOn;
}

function Selected(val : boolean)
{
	if(false == val)
	{
		selectedHighlightOn = false;
		selectedHighlightMod = 0.5;
	}
	else
	{
		if(SlotInhabited())
		{
			var piece : GameObject = GetInhabitant();

			// Determine if the object here can even be selected so as to ignore further stimulus
			if(piece.name.Contains("forker") || piece.name.Contains("brancher"))
			{
				selectable = piece.GetComponent(UnitScript).Selected(val);
			}
			else if(piece.name.Contains("base"))
			{
				selectable = piece.GetComponent(BaseScript).Selected(val);
			}
			else if(piece.name.Contains("bush"))
			{
				selectable = piece.GetComponent(BushScript).Selected(val);
			}
			else if(piece.name.Contains("branch") || piece.name.Contains("fork") || piece.name.Contains("fortification"))
			{
				selectable = piece.GetComponent(PickupScript).Selected(val);
			}
			
			if(selectable)
			{
				selectedHighlightOn = true;
				selectedHighlightMod = 0.5;
			}
		}
	}
}



function MouseoverTarget(position : Vector2)
{
	if(SlotInhabited())
	{
		var piece : GameObject = GetInhabitant();

		currentMouseoverCell = position;
				
		if(piece.name.Contains("forker") || piece.name.Contains("brancher"))
		{
			piece.GetComponent(UnitScript).MouseoverTarget(position);
		}
		else if(piece.name.Contains("base"))
		{
			piece.GetComponent(BaseScript).MouseoverTarget(position);
		}
	}
}

function DoSelectedGUI(rect : Rect)
{
	var piece : GameObject = GetInhabitant();
	var guiBG : Texture = guiBG_default;

	if(SlotInhabited())
	{
		if(selectable)
		{
			if(piece.name.Contains("forker") || piece.name.Contains("brancher"))
			{
				if(piece.GetComponent(UnitScript).IsPlayer())
				{
					guiBG = guiBG_player;
				}
				else
				{
					guiBG = guiBG_opponent;
				}
	
				piece.GetComponent(UnitScript).DoSelectedGUI(rect, guiBG);
			}
			else if(piece.name.Contains("base"))
			{
				if(piece.GetComponent(BaseScript).IsPlayer())
				{
					guiBG = guiBG_player;
				}
				else
				{
					guiBG = guiBG_opponent;
				}
	
				piece.GetComponent(BaseScript).DoSelectedGUI(rect, guiBG);
			}
			else if(piece.name.Contains("bush"))
			{
				piece.GetComponent(BushScript).DoSelectedGUI(rect, guiBG);
			}
			else if(piece.name.Contains("branch") || piece.name.Contains("fork") || piece.name.Contains("fortification"))
			{
				piece.GetComponent(PickupScript).DoSelectedGUI(rect, guiBG);
			}
		}
	}
}

function GetMouseoverGUIRect() : Rect
{
	return Rect(0, Screen.height*0.7, Screen.width*0.35, Screen.height*0.3);
}

function DoMouseoverGUI()
{
	var piece : GameObject = GetInhabitant();	
	var rect : Rect = GetMouseoverGUIRect();
	var guiBG : Texture = guiBG_default;
	
	if(piece.name.Contains("forker") || piece.name.Contains("brancher"))
	{
		if(piece.GetComponent(UnitScript).IsPlayer())
		{
			guiBG = guiBG_player;
		}
		else
		{
			guiBG = guiBG_opponent;
		}

		piece.GetComponent(UnitScript).DoMouseoverGUI(rect, guiBG);
	}
	else if(piece.name.Contains("base"))
	{
		if(piece.GetComponent(BaseScript).IsPlayer())
		{
			guiBG = guiBG_player;
		}
		else
		{
			guiBG = guiBG_opponent;
		}

		piece.GetComponent(BaseScript).DoMouseoverGUI(rect, guiBG);
	}
	else if(piece.name.Contains("bush"))
	{
		piece.GetComponent(BushScript).DoMouseoverGUI(rect, guiBG);
	}
	else if(piece.name.Contains("branch") || piece.name.Contains("fork") || piece.name.Contains("fortification"))
	{
		piece.GetComponent(PickupScript).DoMouseoverGUI(rect, guiBG);
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

function GetParticleSystem() : ParticleSystem
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

function FadeColor(color : Color, mod : float, speed : int) : float
{
	var direction : int = 500 > mod ? 1 : -1;
	
	mod += direction * 10 * Time.deltaTime;
	color.g += mod;
	
	//gameObject.renderer.material.color = color;
	
	GetParticleSystem().startColor = color;
	ToggleParticleSystem(true);
	
	return mod;
}

function DoMouseoverHighlight()
{
	mouseoverHighlightMod = FadeColor(mouseoverHighlightColor, mouseoverHighlightMod, 5);
}

function DoTargetedHighlight()
{
	targetedHighlightTimediff += Time.deltaTime;

	targetedHighlightMod = FadeColor(targetedHighlightColor, targetedHighlightMod, 10);
	
	if(targetedHighlightTimediff >= 2)
	{
		targetedHighlightOn = false;
	}
}

function DoSelectedHighlight()
{
	selectedHighlightMod = FadeColor(selectedHighlightColor, selectedHighlightMod, 2);
}

function DoPathHighlight()
{
	pathHighlightMod = FadeColor(pathHighlightColor, pathHighlightMod, 3);
}

function PositionValid(x : int, y : int) : boolean
{
	var size : Vector2 = GameObject.Find("HexPlain").GetComponent(HexBoardScript).GetSize();
	
	if((0 > x) || (size.x < x) ||
	   (0 > y) || (size.y < y))
		return false;
	
	return true;
}

function GetNeighbor(neighbor : int) : Vector2
{
	var neighborPos : Vector2 = Vector2(-1,-1);
	
	switch(neighbor)
	{
		case NEIGHBOR_AHEAD:
			if(PositionValid(myLocation.x+1, myLocation.y))
				neighborPos =  Vector2(myLocation.x+1, myLocation.y);
			break;
		case NEIGHBOR_BEHIND:
			if(PositionValid(myLocation.x-1, myLocation.y))
				neighborPos = Vector2(myLocation.x-1, myLocation.y);
			break;
		case NEIGHBOR_LEFT:
			if(PositionValid(myLocation.x, myLocation.y-1))
				neighborPos = Vector2(myLocation.x, myLocation.y-1);
			break;
		case NEIGHBOR_RIGHT:
			if(PositionValid(myLocation.x, myLocation.y+1))
				neighborPos = Vector2(myLocation.x, myLocation.y+1);
			break;
		case NEIGHBOR_BACK_LEFT:
			if(PositionValid(myLocation.x-1, myLocation.y-1))
				neighborPos = Vector2(myLocation.x-1, myLocation.y-1);
			break;
		case NEIGHBOR_BACK_RIGHT:
			if(PositionValid(myLocation.x-1, myLocation.y+1))
				neighborPos = Vector2(myLocation.x-1, myLocation.y+1);
			break;
	}
	
	return neighborPos;
}


function GetInhabitant() : GameObject
{
	return inhabitant;
}

function GetInhabitantName() : String
{
	return inhabitant.name;
}

function SlotInhabited() : boolean
{
	return inhabitant_occupied;
}

function SlotPos() : Vector2
{
	return inhabitant_pos;
}

// I broke this out because its reused a few times.
function PositionInhabitant(new_inhabitant : GameObject, z : float)
{
	//var z = new_inhabitant.localPosition.z;
	new_inhabitant.transform.parent = gameObject.transform;
	new_inhabitant.transform.localPosition = Vector3(SlotPos()[0], SlotPos()[1], z);
	inhabitant = new_inhabitant;
	inhabitant_occupied = true;
}

function ClearInhabitant()
{
	inhabitant_occupied = false;
	inhabitant = null;
	
	Selected(false);
	Targeted(false);
	OnMouseExit();
}

function SetInhabitant(new_inhabitant : GameObject) : boolean
{	
	var result : boolean = true;
	var position : Vector2;
	
	if( !SlotInhabited() )
	{
		if(new_inhabitant.name.Contains("forker") || new_inhabitant.name.Contains("brancher"))
		{
			position = new_inhabitant.GetComponent(UnitScript).GetPosition();
		
			if(PositionValid(position.x, position.y))
			{
				// MoveFrom previous position
				GameObject.Find(String.Format("/HexPlain/cell_{0}_{1}_", position.x, position.y)).GetComponent(CellScript).MoveFrom(new_inhabitant);
			}
	
			// MoveTo this position
			PositionInhabitant(new_inhabitant, 3.0);
			
			new_inhabitant.GetComponent(UnitScript).SetPosition(myLocation.x, myLocation.y);
		}
		else if(new_inhabitant.name.Contains("base"))
		{	
			Debug.Log("Positioning Base");
			
			position = new_inhabitant.GetComponent(BaseScript).GetPosition();
		
			if(PositionValid(position.x, position.y))
			{
				// MoveFrom previous position
				GameObject.Find(String.Format("/HexPlain/cell_{0}_{1}_", position.x, position.y)).GetComponent(CellScript).MoveFrom(new_inhabitant);
			}
			
			// MoveTo this position
			PositionInhabitant(new_inhabitant, 3.0);
			
			new_inhabitant.GetComponent(BaseScript).SetPosition(myLocation.x, myLocation.y);
			
			Debug.Log("Base Positioned");
		}
		else if(new_inhabitant.name.Contains("bush"))
		{
			position = new_inhabitant.GetComponent(BushScript).GetPosition();
		
			if(PositionValid(position.x, position.y))
			{
				// MoveFrom previous position
				GameObject.Find(String.Format("/HexPlain/cell_{0}_{1}_", position.x, position.y)).GetComponent(CellScript).MoveFrom(new_inhabitant);
			}
			
			// MoveTo this position
			PositionInhabitant(new_inhabitant, 3.0);
			
			new_inhabitant.GetComponent(BushScript).SetPosition(myLocation.x, myLocation.y);
		}
		else if(new_inhabitant.name.Contains("branch") || new_inhabitant.name.Contains("fork") || new_inhabitant.name.Contains("fortification"))
		{
			position = new_inhabitant.GetComponent(PickupScript).GetPosition();
		
			if(PositionValid(position.x, position.y))
			{
				// MoveFrom previous position
				GameObject.Find(String.Format("/HexPlain/cell_{0}_{1}_", position.x, position.y)).GetComponent(CellScript).MoveFrom(new_inhabitant);
			}
			
			// MoveTo this position
			PositionInhabitant(new_inhabitant, 3.0);
			
			new_inhabitant.GetComponent(PickupScript).SetPosition(myLocation.x, myLocation.y);
		}
		else
		{
			return false;
		}
	}
	else
	{
		// Toggle some UI to depict a failed attempt to position here
	}
	
	return result;
}

function MoveTo(piece : GameObject) : boolean
{
	var result : boolean = true;
	
	/* Name must be set before this point */
	
	result = SetInhabitant(piece);
	
	return result;
}

function MoveFrom(piece : GameObject) : boolean
{
	var result : boolean = true;
	
	if(SlotInhabited() && GetInhabitant().name.Equals(piece.name))
	{
		ClearInhabitant();
	}
	else
	{
		result = false;
	}
	
	return result;
}

function CreateBush(id : int) : boolean
{
	var result : boolean = false;
	
	var bushClone : GameObject = Instantiate(branch_bush);
	bushClone.name = String.Format("bush_{0}", id);

	result = MoveTo(bushClone);
	if(result)
	{
		bushClone.GetComponent(BushScript).SetPosition(myLocation.x, myLocation.y);
	}
	
	return result;
}

function CreateBase(name : String, player : boolean, baseType : String) : boolean
{
	var result : boolean = false;
		
	var baseClone : GameObject = Instantiate(base);
	baseClone.name = name;

	result = MoveTo(baseClone);
	if(result)
	{
		Debug.Log("Base Success!");
		var baseScript : BaseScript = baseClone.GetComponent(BaseScript);
		baseScript.SetBaseType(baseType);
		baseScript.SetPlayerType(player);
		baseScript.SetPosition(myLocation.x, myLocation.y);
	}
	
	return result;
}

function DestroyInhabitant() : boolean
{
	var piece : GameObject = GetInhabitant();
	var result : boolean = false;
	result = MoveFrom(piece);
	if(result)
	{
		Destroy(piece.gameObject);
		Selected(false);
		Targeted(false);
		OnMouseExit();
	}
	
	return result;
}