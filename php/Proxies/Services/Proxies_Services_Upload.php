<?php 

/*
 * Copyright (c) 2014 - Copyright holders CIRSFID and Department of
 * Computer Science and Engineering of the University of Bologna
 * 
 * Authors: 
 * Monica Palmirani – CIRSFID of the University of Bologna
 * Fabio Vitali – Department of Computer Science and Engineering of the University of Bologna
 * Luca Cervone – CIRSFID of the University of Bologna
 * 
 * Permission is hereby granted to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The Software can be used by anyone for purposes without commercial gain,
 * including scientific, individual, and charity purposes. If it is used
 * for purposes having commercial gains, an agreement with the copyright
 * holders is required. The above copyright notice and this permission
 * notice shall be included in all copies or substantial portions of the
 * Software.
 * 
 * Except as contained in this notice, the name(s) of the above copyright
 * holders and authors shall not be used in advertising or otherwise to
 * promote the sale, use or other dealings in this Software without prior
 * written authorization.
 * 
 * The end-user documentation included with the redistribution, if any,
 * must include the following acknowledgment: "This product includes
 * software developed by University of Bologna (CIRSFID and Department of
 * Computer Science and Engineering) and its authors (Monica Palmirani, 
 * Fabio Vitali, Luca Cervone)", in the same place and form as other
 * third-party acknowledgments. Alternatively, this acknowledgment may
 * appear in the software itself, in the same form and location as other
 * such third-party acknowledgments.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
class Proxies_Services_Upload implements Proxies_Services_Interface
{
	private $_filePath;
	private $_fileSize;
	private $_fileName;
		
	/**
	 * The constructor of the service
	 * @return the service object
	 * @param Array the params that are passed to the service
	 */
	public function __construct($params)
	{
		$this->_fileSize = $params;
		if ($_FILES['userfile']['error'] == UPLOAD_ERR_OK               //checks for errors
		      && is_uploaded_file($_FILES['userfile']['tmp_name'])) { //checks that file is uploaded
		  		$this->_filePath = $_FILES['userfile']['tmp_name']; 
				$this->_fileName = $_FILES['userfile']['name']; 
				$this->_fileSize = $_FILES['userfile']['size'];
		}
	}
	
	/**
	 * this method is used to retrive the result by the service
	 * @return The result that the service computed
	 */ 
	public function getResults()
	{
		$output = Array();
		$filename = '';
		$result = '';
		$resultCode = 0;
        
		if (isset($this->_filePath) && isset($this->_fileSize)) {
			$currentDirFullpath = dirname(__FILE__)."/";
			$currentDirWebpath = substr($_SERVER["PHP_SELF"],0, strripos($_SERVER["PHP_SELF"],"/"))."/";
			$token = md5(time().rand(0,1000000));
			$tmpDir = $currentDirFullpath.TMPSUBDIRLOCALPATH.$token;
			if (mkdir($tmpDir)) {
				$tmpDir = realpath($tmpDir);
				umask(0);
				chmod($tmpDir,0777);
				copy($this->_filePath, $tmpDir."/".$this->_fileName);
				$filename = SERVER_NAME.$currentDirWebpath.TMPSUBDIRWEBPATH.$token."/".$this->_fileName;
			}		    
			
		}
		
		return "<script language=\"javascript\" type=\"text/javascript\">
			window.parent.window.jbImagesDialog.uploadFinish({
				filename:'$filename',
				result: '$result',
				resultCode: '$resultCode'
			});
		</script>";
	}
}
?>
