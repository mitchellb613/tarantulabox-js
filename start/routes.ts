/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ view }) => {
  return await view.render('home')
})

Route.get('/user/login', 'LoginController.index')

Route.get('/github/callback', 'LoginController.githubCallback')

Route.get('/github/redirect', async ({ ally }) => {
  return ally.use('github').redirect()
})

Route.get('/discord/callback', 'LoginController.discordCallback')

Route.get('/discord/redirect', async ({ ally }) => {
  return ally.use('discord').redirect()
})

Route.group(() => {
  Route.post('/user/logout', async ({ auth, response, session }) => {
    session.flash('global_message', 'Logged out successfully')
    await auth.use('web').logout()
    response.redirect('/')
  })

  //Tarantula routes
  //CREATE
  Route.get('/user/tarantulas/create', 'TarantulaController.createForm')
  Route.post('/user/tarantulas', 'TarantulaController.create')

  //READ
  Route.get('/user/tarantulas', 'TarantulaController.readAll')
  Route.get('/user/tarantulas/:tarantulaId', 'TarantulaController.readOne')

  //UPDATE
  Route.get('/user/tarantulas/:tarantulaId/update', 'TarantulaController.updateForm')
  Route.put('/user/tarantulas/:tarantulaId/update', 'TarantulaController.update')

  //DELETE
  Route.delete('/user/tarantulas/:tarantulaId/delete', 'TarantulaController.delete')

  //Molt routes
  //CREATE
  Route.get('/user/tarantulas/:tarantulaId/molts/create', 'MoltsController.createForm')
  Route.post('/user/tarantulas/:tarantulaId/molts', 'MoltsController.create')

  //UPDATE
  Route.get('/user/tarantulas/:tarantulaId/molts/:moltId/update', 'MoltsController.updateForm')
  Route.put('/user/tarantulas/:tarantulaId/molts/:moltId/update', 'MoltsController.update')

  //DELETE
  Route.delete('/user/tarantulas/:tarantulaId/molts/:moltId/delete', 'MoltsController.delete')
}).middleware('auth:web')
