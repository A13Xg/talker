# Create an HTTP listener object
$listener = New-Object System.Net.HttpListener 

# Specify the URL to listen on (port 8080 in this example)
$listener.Prefixes.Add("http://localhost:8080/") 

# Start listening
$listener.Start() 

Write-Host "Listening on http://localhost:8080/"

# Loop to handle incoming requests
while ($listener.IsListening) {
    $context = $listener.GetContext() 
    $request = $context.Request 
    $response = $context.Response 

    # Construct a simple HTML response
    $response.StatusCode = 200 
    $response.ContentType = "text/html" 
    $response.ContentEncoding = [System.Text.Encoding]::UTF8 
    $responseBody = Get-Content .\index.html -Raw  
    $response.ContentLength64 = [System.Text.Encoding]::UTF8.GetBytes($responseBody).Length 
    $writer = New-Object System.IO.StreamWriter($response.OutputStream) 
    $writer.Write($responseBody) 
    $writer.Close() 

    $response.Close() 
}

# Stop the listener
$listener.Stop()