#pragma strict

var camHeight : int = 15;
var camPos : Vector3 = Vector3(32,camHeight,32);
var posMax : int = 5;
var posMin : int = 0;
var htMax : int = 15;
var htMin : int = 5;
var camOrigin : Transform;

function Start () {
	gameObject.Find("Main Camera").transform.position = camOrigin.transform.position;
	gameObject.Find("Main Camera").transform.position.y = camHeight;
}

function Update () {

	camPos = gameObject.Find("Main Camera").transform.position;
	if(!Input.GetKey(KeyCode.LeftControl))
    {
    	gameObject.Find("Main Camera").transform.position = Vector3(Mathf.Clamp(camPos.x + Input.GetAxis("Mouse X"), posMin, posMax),
																Mathf.Clamp(camPos.y + Input.GetAxis("Mouse ScrollWheel"), htMin, htMax),
																Mathf.Clamp(camPos.z + Input.GetAxis("Mouse Y"), posMin, posMax));
		
		gameObject.Find("Point light").light.intensity = gameObject.Find("Main Camera").transform.position.y*0.2;
	}
	//.intensity = gameObject.Find("Main Camera").transform.position.y;
}