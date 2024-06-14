
export const filesFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
  // console.log({file})
  if(!file) return callback(new Error('File is empty'), false);
  
  const fileExtension = file.originalname.split('.').pop();
  const validExtension = ['jpg', 'jpeg', 'gif', 'png', 'ico', 'pdf'];
  
  if( validExtension.includes( fileExtension) ){
    return callback(null, true)
  }

  callback(null, false);
}