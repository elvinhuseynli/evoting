// src/Admin.js
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Link } from 'react-router-dom';
import detectEthereumProvider from '@metamask/detect-provider';
import './admin.css';

const CONTRACT_ADDRESS = "0x0b1c7c7aa43679367298E06254C9948beF91a73C";
const ABI = [{
    "inputs": [
      {
        "internalType": "uint256",
        "name": "issueId",
        "type": "uint256"
      }
    ],
    "name": "closeIssue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "issueId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "yesCount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "noCount",
        "type": "uint256"
      }
    ],
    "name": "IssueClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "issueId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "closeTimestamp",
        "type": "uint256"
      }
    ],
    "name": "IssueOpened",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      }
    ],
    "name": "openIssue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "issueId",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "voteYes",
        "type": "bool"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "issueId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "voteYes",
        "type": "bool"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "issueId",
        "type": "uint256"
      }
    ],
    "name": "getIssue",
    "outputs": [
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isOpen",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "yesCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "noCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "closeTimestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "issueCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "issues",
    "outputs": [
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isOpen",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "yesCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "noCount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "closeTimestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];







const Admin = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [issueCount, setIssueCount] = useState(0);
  const [issues, setIssues] = useState([]);
  const [newIssueDescription, setNewIssueDescription] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadBlockchainData = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        const contractInstance = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
        setContract(contractInstance);
        const admin = await contractInstance.methods.admin().call();
        setIsAdmin(accounts[0] === admin);
        const issueCount = await contractInstance.methods.issueCount().call();
        setIssueCount(issueCount);
        loadIssues(contractInstance, issueCount);
      }
    };

    const loadIssues = async (contract, issueCount) => {
      let issuesArray = [];
      for (let i = 1; i <= issueCount; i++) {
        const issue = await contract.methods.getIssue(i).call();
        issuesArray.push({
          description: issue.description,
          yesCount: issue.yesCount ? parseInt(issue.yesCount) : 0,
          noCount: issue.noCount ? parseInt(issue.noCount) : 0,
          isOpen: issue.isOpen,
          closeTimestamp: parseInt(issue.closeTimestamp) * 1000, // Convert to milliseconds
        });
      }
      setIssues(issuesArray);
    };

    loadBlockchainData();
  }, []);

  const openIssue = async (description) => {
    setIsLoading(true);
    try {
      await contract.methods.openIssue(description).send({ from: account });
      setIsLoading(false);
      window.location.reload();
    } catch (error) {
      setIsLoading(false);
      if (error.code === 4001) {
        setErrorMessage('Transaction rejected by user.');
      } else {
        setErrorMessage('An error occurred while processing the transaction.');
      }
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Page</h1>
      <p className="account-info">Account: {account}</p>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {notification && <p className="notification-message">{notification}</p>}
      {isLoading && <p className="loading-message">Transaction in progress...</p>}
      {isAdmin && (
        <div>
          <h2>Open a New Issue</h2>
          <input
            type="text"
            value={newIssueDescription}
            onChange={(e) => setNewIssueDescription(e.target.value)}
            placeholder="Enter issue description"
            className="issue-input"
          />
          <button onClick={() => openIssue(newIssueDescription)}>Open Issue</button>
        </div>
      )}
      <h2>Issues Progress</h2>
      <table>
        <thead>
          <tr>
            <th>Issue ID</th>
            <th>Description</th>
            <th>Yes Count</th>
            <th>No Count</th>
            <th>Status</th>
            <th>Closes In</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{issue.description}</td>
              <td>{issue.yesCount}</td>
              <td>{issue.noCount}</td>
              <td>{issue.isOpen ? 'Open' : 'Closed'}</td>
              <td>{issue.isOpen ? new Date(issue.closeTimestamp).toLocaleString() : 'Closed'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/">
        <button className="back-button">Back to Main Page</button>
      </Link>
    </div>
  );
};

export default Admin;