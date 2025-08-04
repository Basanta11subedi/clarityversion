import { useState, useEffect } from 'react';
import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('v2');
  const [contractName, setContractName] = useState('');
  const [contractCode, setContractCode] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
     const checkConnection = async () => {
       const connected = isConnected();
       setIsWalletConnected(connected);

      if (connected) {
        const storage = getLocalStorage();
         const address = storage?.addresses?.stx?.[0]?.address;
         if (address) {
          setWalletAddress(address);
        }
       }
    };

     checkConnection();
   }, []);

  const handleConnectWallet = async () => {
    try {
      await connect();
      setIsWalletConnected(true);
      const storage = getLocalStorage();
      const address = storage?.addresses?.stx?.[0]?.address;
      if (address) {
        setWalletAddress(address);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleDisconnectWallet = () => {
    disconnect();
    setIsWalletConnected(false);
    setWalletAddress('');
  };

  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      setDeploymentStatus('Preparing deployment...');

      if (!isConnected || !walletAddress) {
        throw new Error('Wallet not connected');
      }

      if (!contractName.trim()) {
        throw new Error('Contract name is required');
      }

      if (!contractCode.trim()) {
        throw new Error('Contract code is required');
      }

      setDeploymentStatus('Waiting for wallet confirmation...');

      const response = await request('stx_deployContract', {
        name: contractName,
        clarityCode: contractCode,
        clarityVersion: activeTab === 'v2' ? '2' : '3',
        network: 'testnet'
      });

      if (!response?.txid) {
        throw new Error('Deployment failed - no transaction ID received');
      }

      setDeploymentStatus(`Deployment successful! TX ID: ${response.txid}`);
      setContractName('');
      setContractCode('');
    } catch (err) {
      console.error(err);
      setDeploymentStatus(`Error: ${err.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-indigo-600 rounded-full filter blur-3xl opacity-20 animate-float1"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-float2"></div>
        <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-blue-600 rounded-full filter blur-3xl opacity-20 animate-float3"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-300">
              Clarity Deployer
            </h1>
          </div>
          
          {isWalletConnected ? (
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <button 
                  onClick={copyAddress}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-indigo-400/50"
                >
                  <span className="text-sm font-mono">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
                {showCopied && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-indigo-500 text-white text-xs rounded-md animate-fade">
                    Copied!
                  </div>
                )}
              </div>
              <button
                onClick={handleDisconnectWallet}
                className="px-4 py-2 bg-gradient-to-r from-red-500/90 to-red-600/90 hover:from-red-600/90 hover:to-red-700/90 rounded-lg transition-all duration-200 shadow-md hover:shadow-red-500/20 flex items-center space-x-1"
              >
                <span>Disconnect</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-indigo-500/20 flex items-center space-x-2"
            >
              <span>Connect Wallet</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto p-4 mt-8 max-w-4xl">
        {!isWalletConnected ? (
          <div className="text-center bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-700/50 max-w-md mx-auto transform transition-all hover:scale-[1.01]">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="mb-6 text-gray-400">To deploy Clarity contracts, please connect your Stacks wallet</p>
            <button
              onClick={handleConnectWallet}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg transition-all duration-200 shadow-lg hover:shadow-indigo-500/30 text-lg font-medium"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-700/50 transform transition-all hover:border-indigo-500/30">
            {/* Version Tabs */}
            <div className="flex border-b border-gray-700/50">
              <button
                className={`px-8 py-4 font-medium text-sm uppercase tracking-wider flex-1 flex items-center justify-center space-x-2 transition-all duration-200 ${
                  activeTab === 'v2' 
                    ? 'text-indigo-400 border-b-2 border-indigo-400 bg-gradient-to-t from-indigo-900/10 to-transparent' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/20'
                }`}
                onClick={() => setActiveTab('v2')}
              >
                <span>Clarity v2</span>
                {activeTab === 'v2' && (
                  <span className="px-2 py-0.5 bg-indigo-400/10 text-indigo-300 text-xs rounded-full">Current</span>
                )}
              </button>
              <button
                className={`px-8 py-4 font-medium text-sm uppercase tracking-wider flex-1 flex items-center justify-center space-x-2 transition-all duration-200 ${
                  activeTab === 'v3' 
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-gradient-to-t from-purple-900/10 to-transparent' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/20'
                }`}
                onClick={() => setActiveTab('v3')}
              >
                <span>Clarity v3</span>
                {activeTab === 'v3' && (
                  <span className="px-2 py-0.5 bg-purple-400/10 text-purple-300 text-xs rounded-full">Latest</span>
                )}
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="contractName" className="block text-sm font-medium text-gray-300 mb-2">
                  Contract Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="contractName"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-all duration-200"
                    placeholder="my-contract"
                  />
                  {contractName && (
                    <button 
                      onClick={() => setContractName('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="contractCode" className="block text-sm font-medium text-gray-300">
                    Clarity Code ({activeTab === 'v2' ? 'Version 2' : 'Version 3'})
                  </label>
                  <span className="text-xs text-gray-500">
                    {contractCode.length} characters
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    id="contractCode"
                    value={contractCode}
                    onChange={(e) => setContractCode(e.target.value)}
                    className="w-full h-96 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-all duration-200 resize-none"
                    placeholder={`(define-public (hello-world)\n  (ok "Hello, Clarity ${activeTab === 'v2' ? 'v2' : 'v3'}!"))`}
                  ></textarea>
                  {contractCode && (
                    <button 
                      onClick={() => setContractCode('')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="text-sm font-medium">
                  <span className="text-gray-400">Network:</span>{' '}
                  <span className="text-indigo-400">Testnet</span>
                </div>
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying || !contractName || !contractCode}
                  className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center space-x-2 ${
                    isDeploying || !contractName || !contractCode
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-indigo-500/30'
                  }`}
                >
                  {isDeploying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Deploying...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Deploy Contract</span>
                    </>
                  )}
                </button>
              </div>

              {deploymentStatus && (
                <div className={`mt-6 p-4 rounded-lg border ${
                  deploymentStatus.includes('Error') 
                    ? 'bg-red-900/20 border-red-700/50 text-red-300' 
                    : 'bg-green-900/20 border-green-700/50 text-green-300'
                }`}>
                  <div className="flex items-start space-x-3">
                    {deploymentStatus.includes('Error') ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    <div className="text-sm">
                      {deploymentStatus}
                      {deploymentStatus.includes('TX ID') && (
                        <button 
                          onClick={() => navigator.clipboard.writeText(deploymentStatus.split('TX ID: ')[1])}
                          className="ml-2 text-xs bg-green-800/50 hover:bg-green-700/50 px-2 py-1 rounded inline-flex items-center"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 py-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>Clarity Contract Deployer - Deploy v2 and v3 contracts with ease</p>
      </footer>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, 10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, 5px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(5px, -10px); }
        }
        @keyframes fade {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float1 { animation: float1 8s ease-in-out infinite; }
        .animate-float2 { animation: float2 10s ease-in-out infinite; }
        .animate-float3 { animation: float3 12s ease-in-out infinite; }
        .animate-fade { animation: fade 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default App;