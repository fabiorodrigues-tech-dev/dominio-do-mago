-- Atualiza o avatar 3D do Mago Mestre para o modelo otimizado de Mago local
UPDATE users 
SET avatar_glb_url = '/avatar_fabio.glb'
WHERE email = 'fabioandre777@gmail.com';
