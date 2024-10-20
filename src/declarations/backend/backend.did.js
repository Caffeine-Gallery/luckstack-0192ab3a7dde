export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addFunds' : IDL.Func([IDL.Float64], [], []),
    'getBalance' : IDL.Func([IDL.Principal], [IDL.Float64], ['query']),
    'placeBet' : IDL.Func([IDL.Float64], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
