# List of events

<table>
<thead>
<tr>
<th align="center">functions</th>
<th>events</th>
<th>links</th>
</tr>
</thead>
<tbody>
<tr>
<td align="center"><b>TransferPoolOwnership</b></td>
<td align="left"><pre>
<b>id: 0</b>  PoolOwnershipTransfered(uint256 PoolId, address NewOwner, address OldOwner)</pre></td>
<td><a href="https://testnet.bscscan.com/tx/0x54cbdf138be5ad711f648bc2d9e7086d29f064e8afc82e89f36f04b5c69d7e44#eventlog">TransferPoolOwnership</a></td>
</tr>
<tr>
<td align="center"><b>SplitPoolAmount</b></td>
<td align="left"><pre>
<b>id: 0</b>  NewPoolCreated(uint256 PoolId, address Token, uint256 StartTime, uint256 FinishTime, uint256 StartAmount, address Owner)
<b>id: 1</b>  PoolSplit(uint256 OldPoolId, uint256 NewPoolId, uint256 NewAmount, address NewOwner)
</pre></td>
<td><a href="https://testnet.bscscan.com/tx/0x3c448f482b866eb8c379a3599d0555013a2396dde327a992d38267c28abdea19#eventlog">SplitPoolAmount</a></td>
</tr>
<tr>
<td align="center"><b>ApproveAllowance</b></td>
<td align="left"><pre>
<b>id: 0</b>  PoolApproval(uint256 PoolId, address Spender, uint256 Amount)
</pre></td>
<td><a href="https://testnet.bscscan.com/tx/0x947d2b2cede1496907c26dba9701a77aa98ecf8236c8210f721eba17b107b1af#eventlog">ApproveAllowance</a>
</td>
</tr>
  <tr>
<td align="center"><b>SplitPoolAmountFrom</b></td>
<td align="left"><pre>
<b>id: 0</b> NewPoolCreated(uint256 PoolId, address Token, uint256 StartTime, uint256 FinishTime, uint256 StartAmount, address Owner)
<b>id: 1</b> PoolSplit(uint256 OldPoolId, uint256 NewPoolId, uint256 NewAmount, address NewOwner)
<td><a href="https://testnet.bscscan.com/tx/0xecf9e18a1013d9c8cd404f798b66152fd3499cff46f3f2938f060e064ee5ef0f#eventlog">SplitPoolAmountFrom</a>
</td>
</tr>
<tr>
<td align="center"><b>CreateNewPool</b></td>
<td align="left"><pre>
<b>if don't pay fee</b>
       TransferIn(uint256 Amount, address From, address Token)
       NewPoolCreated(uint256 PoolId, address Token, uint256 StartTime, uint256 FinishTime, uint256 StartAmount, address Owner)
<br>
<b>if pay fee with main coin</b>
       TransferIn(uint256 Amount, address From, address Token)
       TransferInETH(uint256 Amount, address From)
       NewPoolCreated(uint256 PoolId, address Token, uint256 StartTime, uint256 FinishTime, uint256 StartAmount, address Owner)
<br>
<b>if pay fee with erc20 </b>
       TransferIn(uint256 Amount, address From, address Token) 
       TransferIn(uint256 Amount, address From, address Token) 
       NewPoolCreated(uint256 PoolId, address Token, uint256 StartTime, uint256 FinishTime, uint256 StartAmount, address Owner)
</pre></td>
<td><a href="https://testnet.bscscan.com/tx/0x480981aef6e4421edbaddce7c03764f09b168de82f37a51a42f0d4229b260dfc#eventlog">CreateNewPool</a>
</td>
</tr>
<tr>
<td align="center"><b>CreateMassPools</b></td>
<td align="left"><pre>
<b>if don't pay fee</b>
       TransferIn(uint256 Amount, address From, address Token)
       NewPoolCreated(uint256 PoolId, address Token, uint256 StartTime, uint256 FinishTime, uint256 StartAmount, address Owner)
       MassPoolsCreated(uint256 FirstPoolId, uint256 LastPoolId)<br>
<b>if pay fee with main coin</b>
       TransferIn(uint256 Amount, address From, address Token)
       TransferInETH(uint256 Amount, address From)
       NewPoolCreated(uint256 PoolId, address Token, uint256 StartTime, uint256 FinishTime, uint256 StartAmount, address Owner)
       MassPoolsCreated(uint256 FirstPoolId, uint256 LastPoolId)
<br>
<b>if pay fee with erc20 </b>
       TransferIn(uint256 Amount, address From, address Token)
       TransferIn(uint256 Amount, address From, address Token)
       NewPoolCreated(uint256 PoolId, address Token, uint256 StartTime, uint256 FinishTime, uint256 StartAmount, address Owner)
       MassPoolsCreated(uint256 FirstPoolId, uint256 LastPoolId)
</pre></td>
<td><a href="https://testnet.bscscan.com/tx/0xd0acd51a56bb7dcb4357a7c660ea82678cfa8542c2a7912c029aca1c6dea679e#eventlog">CreateMassPools</a></td>
</tr>
  <tr>
<td align="center"><b>CreatePoolsWrtTime</b></td>
<td align="left"><pre>
<b>if don't pay fee</b>
       TransferIn(uint256 Amount, address From, address Token)
       NewPoolCreated(uint256 PoolId, address Token, uint256 StartTime, uint256 FinishTime, uint256 StartAmount, address Owner)
       MassPoolsCreated(uint256 FirstPoolId, uint256 LastPoolId)<br>
<b>if pay fee with main coin</b>
       TransferIn(uint256 Amount, address From, address Token)
       TransferInETH(uint256 Amount, address From)
       NewPoolCreated(uint256 PoolId, address Token, uint256 StartTime, uint256 FinishTime, uint256 StartAmount, address Owner)
       MassPoolsCreated(uint256 FirstPoolId, uint256 LastPoolId)
<br>
<b>if pay fee with erc20 </b>
       TransferIn(uint256 Amount, address From, address Token)
       TransferIn(uint256 Amount, address From, address Token)
       NewPoolCreated(uint256 PoolId, address Token, uint256 StartTime, uint256 FinishTime, uint256 StartAmount, address Owner)
       MassPoolsCreated(uint256 FirstPoolId, uint256 LastPoolId)
</pre></td>
<td><a href="https://testnet.bscscan.com/tx/0x4be6d53d04253b9d8c158856e819dc9d07ae3221f875c2769f5dfc286c1137c9#eventlog">CreatePoolsWrtTime</a></td>
</tr>
<tr>
<td align="center"><b>WithdrawToken</b></td>
<td align="left"><pre>
       TransferOut(uint256 Amount, address To, address Token)
       TokenWithdrawn(uint256 PoolId, address Recipient, uint256 Amount)
</pre></td>
<td><a href="https://testnet.bscscan.com/tx/0xaf0f7a210f70da871a85652539a3fb944604fa87f2ad588612e736fce9a255c7#eventlog">WithdrawToken</a></td>
</tr>
</tbody>
</table>