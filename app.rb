require 'sinatra'
require 'json'

get '/' do
  File.read('views/index.html')
end

get '/favorites' do
  response.header['Content-Type'] = 'application/json'
  File.read('data.json')
end

post '/favorites' do
  file = JSON.parse(File.read('data.json'))
  params = JSON.parse(request.body.read)
  unless params["Title"] && params["oid"]
    return "Invalid Request"
  end
  movie = { Title: params["Title"], oid: params["oid"] }
  file << movie
  File.write('data.json',JSON.pretty_generate(file))
  movie.to_json
end
