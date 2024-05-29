// src/User.js
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import './user.css';

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
  }];

  






  const User = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [issueCount, setIssueCount] = useState(0);
    const [issues, setIssues] = useState([]);
    const [votedIssues, setVotedIssues] = useState(new Set());
  
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
          const issueCount = await contractInstance.methods.issueCount().call();
          setIssueCount(issueCount);
          loadIssues(contractInstance, issueCount);
        }
      };
  
      const loadIssues = async (contract, issueCount) => {
        let issuesArray = [];
        for (let i = 1; i <= issueCount; i++) {
          const issue = await contract.methods.getIssue(i).call();
          issuesArray.push(issue);
        }
        setIssues(issuesArray);
      };
  
      loadBlockchainData();
    }, []);
  
    const vote = async (issueId, voteYes) => {
      if (votedIssues.has(issueId)) {
        alert('You have already voted on this issue.');
        return;
      }
      await contract.methods.vote(issueId, voteYes).send({ from: account });
      setVotedIssues(new Set(votedIssues).add(issueId));
      window.location.reload();
    };
  
    return (
      <div className="user-container">
        <h1>User Page</h1>
        <p>Account: {account}</p>
        <h2>Vote</h2>
        {issues.map((issue, index) => (
          <div className="issue" key={index}>
            <p>Description: {issue.description}</p>
            <p>Yes Count: {issue.yesCount}</p>
            <p>No Count: {issue.noCount}</p>
            <button onClick={() => vote(index + 1, true)} disabled={votedIssues.has(index + 1)}>Vote Yes</button>
            <button onClick={() => vote(index + 1, false)} disabled={votedIssues.has(index + 1)}>Vote No</button>
          </div>
        ))}
        <h2>Issues Progress</h2>
        <table>
          <thead>
            <tr>
              <th>Issue ID</th>
              <th>Description</th>
              <th>Yes Count</th>
              <th>No Count</th>
              <th>Status</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default User;